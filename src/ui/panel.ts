import {
  MOTION_TOKENS,
  animateElement,
  nextFrame,
  stopAnimations,
  waitForAnimations
} from '../lib/motion';

type DialogKind = 'chamber' | 'document';

interface DialogControllerOptions {
  kind?: DialogKind;
  initialFocus?: () => HTMLElement | null;
  fallbackFocus?: () => HTMLElement | null;
  onRequestClose: () => void;
}

export class DialogController {
  private isOpen = false;
  private restoreTarget: HTMLElement | null = null;
  private readonly kind: DialogKind;
  private readonly scrim: HTMLElement;
  private readonly surface: HTMLElement;
  private motionToken = 0;

  constructor(
    private readonly root: HTMLElement,
    private readonly options: DialogControllerOptions
  ) {
    const scrim = this.root.querySelector<HTMLElement>('.overlay__scrim');
    const surface = this.root.querySelector<HTMLElement>('[data-panel-surface]');
    if (!scrim || !surface) {
      throw new Error('Dialog frame not found.');
    }

    this.kind = this.options.kind ?? 'chamber';
    this.scrim = scrim;
    this.surface = surface;
    this.root.hidden = true;
    this.root.dataset.open = 'false';
    this.root.setAttribute('aria-hidden', 'true');
    this.bind();
  }

  async open(opener: HTMLElement | null = null): Promise<void> {
    this.restoreTarget =
      opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);

    if (this.isOpen) {
      await this.retarget();
      this.focusInitial();
      return;
    }

    const token = ++this.motionToken;
    this.isOpen = true;
    this.root.hidden = false;
    this.root.dataset.open = 'true';
    this.root.setAttribute('aria-hidden', 'false');

    stopAnimations(this.scrim);
    stopAnimations(this.surface);

    const scrimAnimation = animateElement(
      this.scrim,
      [{ opacity: 0 }, { opacity: 1 }],
      {
        duration: MOTION_TOKENS.duration.scrimEnter,
        easing: MOTION_TOKENS.easing.standard,
        fill: 'both'
      }
    );

    const surfaceAnimation = animateElement(
      this.surface,
      [
        { opacity: 0, transform: 'translateY(28px) scale(0.975)' },
        { opacity: 1, transform: 'translateY(0px) scale(1)' }
      ],
      {
        duration: this.getDurations().enter,
        easing: MOTION_TOKENS.easing.enter,
        fill: 'both'
      }
    );

    void nextFrame().then(() => {
      if (token === this.motionToken) {
        this.focusInitial();
      }
    });

    await waitForAnimations([scrimAnimation, surfaceAnimation]);
  }

  async close(options: { restoreFocus?: boolean } = {}): Promise<void> {
    const restoreFocus = options.restoreFocus ?? true;

    if (!this.isOpen && this.root.hidden) {
      return;
    }

    const token = ++this.motionToken;
    this.isOpen = false;
    this.root.dataset.open = 'false';
    this.root.setAttribute('aria-hidden', 'true');

    stopAnimations(this.scrim);
    stopAnimations(this.surface);

    const overlayAnimation = animateElement(
      this.scrim,
      [{ opacity: 1 }, { opacity: 0 }],
      {
        duration: MOTION_TOKENS.duration.scrimExit,
        easing: MOTION_TOKENS.easing.exit,
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
        duration: this.getDurations().exit,
        easing: MOTION_TOKENS.easing.exit,
        fill: 'both'
      }
    );

    await waitForAnimations([overlayAnimation, surfaceAnimation]);

    if (token !== this.motionToken) {
      return;
    }

    this.root.hidden = true;
    if (restoreFocus) {
      this.restore();
    }
  }

  async retarget(): Promise<void> {
    if (!this.isOpen || this.root.hidden) {
      return;
    }

    const token = ++this.motionToken;
    stopAnimations(this.surface);

    const surfaceAnimation = animateElement(
      this.surface,
      [
        { opacity: 0.82, transform: 'translateY(10px) scale(0.992)' },
        { opacity: 1, transform: 'translateY(0px) scale(1)' }
      ],
      {
        duration: MOTION_TOKENS.duration.retarget,
        easing: MOTION_TOKENS.easing.enter,
        fill: 'both'
      }
    );

    await waitForAnimations([surfaceAnimation]);

    if (token !== this.motionToken) {
      return;
    }
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

    if (event.key === 'Tab' && this.isOpen) {
      this.trapFocus(event);
    }
  };

  private getDurations(): { enter: number; exit: number } {
    if (this.kind === 'document') {
      return {
        enter: MOTION_TOKENS.duration.documentEnter,
        exit: MOTION_TOKENS.duration.documentExit
      };
    }

    return {
      enter: MOTION_TOKENS.duration.chamberEnter,
      exit: MOTION_TOKENS.duration.chamberExit
    };
  }

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
    const preferredTarget = this.options.initialFocus?.() ?? null;
    const target = this.isRestorableTarget(preferredTarget)
      ? preferredTarget
      : this.getFocusableElements()[0] ?? this.surface;
    target.focus();
  }

  private restore(): void {
    const fallbackTarget = this.options.fallbackFocus?.() ?? null;
    const target = this.isRestorableTarget(this.restoreTarget)
      ? this.restoreTarget
      : this.isRestorableTarget(fallbackTarget)
        ? fallbackTarget
        : null;

    target?.focus();
  }

  private getFocusableElements(): HTMLElement[] {
    return Array.from(
      this.root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.closest('[hidden]'));
  }

  private isRestorableTarget(element: HTMLElement | null | undefined): element is HTMLElement {
    return Boolean(element && element.isConnected && !element.closest('[hidden]') && !element.hasAttribute('disabled'));
  }
}
