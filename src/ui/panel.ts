import { animateElement } from '../lib/motion';

interface DialogControllerOptions {
  initialFocus?: () => HTMLElement | null;
  fallbackFocus?: () => HTMLElement | null;
  onRequestClose: () => void;
}

export class DialogController {
  private isOpen = false;
  private restoreTarget: HTMLElement | null = null;
  private readonly surface: HTMLElement;

  constructor(
    private readonly root: HTMLElement,
    private readonly options: DialogControllerOptions
  ) {
    const surface = this.root.querySelector<HTMLElement>('[data-panel-surface]');
    if (!surface) {
      throw new Error('Dialog surface not found.');
    }

    this.surface = surface;
    this.root.hidden = true;
    this.root.dataset.open = 'false';
    this.root.setAttribute('aria-hidden', 'true');
    this.bind();
  }

  open(opener: HTMLElement | null = null): void {
    this.restoreTarget =
      opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);

    if (this.isOpen) {
      this.focusInitial();
      return;
    }

    this.isOpen = true;
    this.root.hidden = false;
    this.root.dataset.open = 'true';
    this.root.setAttribute('aria-hidden', 'false');

    animateElement(
      this.root,
      [{ opacity: 0 }, { opacity: 1 }],
      {
        duration: 260,
        easing: 'ease-out',
        fill: 'both'
      }
    );

    animateElement(
      this.surface,
      [
        { opacity: 0, transform: 'translateY(24px) scale(0.985)' },
        { opacity: 1, transform: 'translateY(0px) scale(1)' }
      ],
      {
        duration: 460,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'both'
      }
    );

    requestAnimationFrame(() => {
      this.focusInitial();
    });
  }

  close(options: { restoreFocus?: boolean } = {}): void {
    const restoreFocus = options.restoreFocus ?? true;

    if (!this.isOpen && this.root.hidden) {
      return;
    }

    this.isOpen = false;
    this.root.dataset.open = 'false';
    this.root.setAttribute('aria-hidden', 'true');

    const overlayAnimation = animateElement(
      this.root,
      [{ opacity: 1 }, { opacity: 0 }],
      {
        duration: 220,
        easing: 'ease-in',
        fill: 'both'
      }
    );

    const surfaceAnimation = animateElement(
      this.surface,
      [
        { opacity: 1, transform: 'translateY(0px) scale(1)' },
        { opacity: 0, transform: 'translateY(18px) scale(0.99)' }
      ],
      {
        duration: 220,
        easing: 'ease-in',
        fill: 'both'
      }
    );

    const finish = (): void => {
      this.root.hidden = true;
      if (restoreFocus) {
        this.restore();
      }
    };

    const pendingAnimations = [overlayAnimation, surfaceAnimation].filter(
      (animation): animation is Animation => Boolean(animation)
    );

    if (!pendingAnimations.length) {
      finish();
      return;
    }

    Promise.all(pendingAnimations.map((animation) => animation.finished.catch(() => undefined))).finally(
      finish
    );
  }

  destroy(): void {
    this.root.removeEventListener('click', this.onClick);
    this.root.removeEventListener('keydown', this.onKeyDown);
  }

  private bind(): void {
    this.root.addEventListener('click', this.onClick);
    this.root.addEventListener('keydown', this.onKeyDown);
  }

  private readonly onClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('[data-close]')) {
      return;
    }

    event.preventDefault();
    this.options.onRequestClose();
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.options.onRequestClose();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  };

  private trapFocus(event: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements();

    if (!focusableElements.length) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
  }

  private focusInitial(): void {
    const target =
      this.options.initialFocus?.() ?? this.getFocusableElements()[0] ?? this.surface;
    target.focus();
  }

  private restore(): void {
    const target = this.restoreTarget?.isConnected
      ? this.restoreTarget
      : this.options.fallbackFocus?.() ?? null;

    target?.focus();
  }

  private getFocusableElements(): HTMLElement[] {
    return Array.from(
      this.root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.closest('[hidden]'));
  }
}
