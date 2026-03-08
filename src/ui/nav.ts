import type { ChamberKey } from '../content/types';
import { MOTION_TOKENS, animateElement, stopAnimations } from '../lib/motion';

interface DockNavOptions {
  onNavigate: (key: ChamberKey, opener: HTMLAnchorElement) => void;
}

export class DockNav {
  private readonly links = new Map<ChamberKey, HTMLAnchorElement>();
  private readonly indicator: HTMLElement;
  private readonly resizeObserver?: ResizeObserver;
  private activeKey: ChamberKey | null = null;

  constructor(
    private readonly root: HTMLElement,
    private readonly options: DockNavOptions
  ) {
    const indicator = this.root.querySelector<HTMLElement>('.dock-nav__indicator');
    if (!indicator) {
      throw new Error('Dock nav indicator not found.');
    }

    this.indicator = indicator;

    this.root.querySelectorAll<HTMLAnchorElement>('[data-chamber]').forEach((link) => {
      const chamber = link.dataset.chamber as ChamberKey | undefined;
      if (!chamber) {
        return;
      }

      this.links.set(chamber, link);
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.options.onNavigate(chamber, link);
      });
    });

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.positionIndicator(false);
      });
      this.resizeObserver.observe(this.root);
    }
  }

  setActive(key: ChamberKey | null): void {
    this.activeKey = key;
    this.root.dataset.active = key ? 'true' : 'false';

    this.links.forEach((link, linkKey) => {
      link.dataset.active = String(linkKey === key);
    });

    this.positionIndicator(true);
  }

  getLink(key: ChamberKey): HTMLAnchorElement | null {
    return this.links.get(key) ?? null;
  }

  destroy(): void {
    this.resizeObserver?.disconnect();
  }

  private positionIndicator(animate: boolean): void {
    if (!this.activeKey) {
      this.indicator.dataset.visible = 'false';
      stopAnimations(this.indicator);

      if (animate) {
        animateElement(
          this.indicator,
          [{ opacity: 1, transform: this.indicator.style.transform || 'translateX(0px)' }, { opacity: 0, transform: this.indicator.style.transform || 'translateX(0px)' }],
          {
            duration: MOTION_TOKENS.duration.standard,
            easing: MOTION_TOKENS.easing.exit,
            fill: 'both'
          }
        );
      }

      this.indicator.style.opacity = '0';
      return;
    }

    const activeLink = this.links.get(this.activeKey);
    if (!activeLink) {
      return;
    }

    const rootBox = this.root.getBoundingClientRect();
    const linkBox = activeLink.getBoundingClientRect();
    const nextWidth = Math.max(Math.min(linkBox.width - 18, 118), 74);
    const nextX = linkBox.left - rootBox.left + (linkBox.width - nextWidth) / 2;

    const previousX = Number(this.indicator.dataset.x ?? nextX);
    const previousWidth = Number(this.indicator.dataset.width ?? nextWidth);

    this.indicator.dataset.visible = 'true';
    this.indicator.style.opacity = '1';
    stopAnimations(this.indicator);

    if (animate) {
      animateElement(
        this.indicator,
        [
          {
            opacity: 0.78,
            transform: `translateX(${previousX}px) scale(0.96)`,
            width: `${previousWidth}px`
          },
          {
            opacity: 1,
            transform: `translateX(${nextX}px) scale(1)`,
            width: `${nextWidth}px`
          }
        ],
        {
          duration: MOTION_TOKENS.duration.dockShift,
          easing: MOTION_TOKENS.easing.enter,
          fill: 'both'
        }
      );
    }

    this.indicator.dataset.x = String(nextX);
    this.indicator.dataset.width = String(nextWidth);
    this.indicator.style.transform = `translateX(${nextX}px)`;
    this.indicator.style.width = `${nextWidth}px`;
  }
}
