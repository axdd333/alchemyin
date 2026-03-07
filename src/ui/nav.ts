import type { ChamberKey } from '../content/types';
import { animateElement } from '../lib/motion';

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
      this.indicator.style.opacity = '0';
      return;
    }

    const activeLink = this.links.get(this.activeKey);
    if (!activeLink) {
      return;
    }

    const rootBox = this.root.getBoundingClientRect();
    const linkBox = activeLink.getBoundingClientRect();
    const nextX = linkBox.left - rootBox.left + 10;
    const nextWidth = Math.max(linkBox.width - 20, 48);

    const previousX = Number(this.indicator.dataset.x ?? nextX);
    const previousWidth = Number(this.indicator.dataset.width ?? nextWidth);

    this.indicator.dataset.visible = 'true';
    this.indicator.style.opacity = '1';

    if (animate) {
      animateElement(
        this.indicator,
        [
          {
            transform: `translateX(${previousX}px)`,
            width: `${previousWidth}px`
          },
          {
            transform: `translateX(${nextX}px)`,
            width: `${nextWidth}px`
          }
        ],
        {
          duration: 340,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
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
