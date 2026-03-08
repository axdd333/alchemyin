import { CHAMBERS, CHAMBER_ORDER } from './content/chambers';
import { DOCUMENTS } from './content/documents';
import type { AppRoute, ChamberKey, DocumentId, ThemeKey } from './content/types';
import { waitForFonts, withViewTransition } from './lib/motion';
import { HashRouter, routeToHash } from './lib/router';
import { HeroScene } from './scene/heroScene';
import { DockNav } from './ui/nav';
import { DialogController } from './ui/panel';

function buildTemplate(assetBase: string): string {
  const chamberLinks = CHAMBER_ORDER.map((key) => {
    const chamber = CHAMBERS[key];
    return `
      <a href="#${key}" class="dock-nav__link" data-chamber="${key}" data-route="${key}">
        <span>${chamber.navLabel}</span>
      </a>
    `;
  }).join('');

  return `
    <div
      class="alchemy-shell"
      data-ready="false"
      data-theme="neutral"
      data-overlay="idle"
    >
      <div class="alchemy-shell__wash" aria-hidden="true"></div>
      <div class="alchemy-shell__grain" aria-hidden="true"></div>

      <div class="loading-veil" aria-hidden="true">
        <div class="loading-veil__mark">
          <span class="loading-veil__sigil"></span>
          <span class="loading-veil__label">Composing the chamber</span>
        </div>
      </div>

      <main class="stage">
        <section class="hero">
          <div class="hero__frame" aria-label="Alchemy core environment">
            <div class="hero__paper" aria-hidden="true"></div>
            <div class="hero__axis" aria-hidden="true"></div>
            <img class="hero__artwork" src="${assetBase}media/alchemy-hero.jpg" alt="" aria-hidden="true">
            <canvas id="hero-scene" class="hero__scene" aria-hidden="true"></canvas>
            <p class="sr-only" id="ambient-note">A chambered studio for philosophy, systems, artifacts, and oracle work.</p>

            <header class="masthead">
              <div class="masthead__capsule">
                <a href="#" class="masthead__brand masthead__brand--front" data-home>
                  <span class="masthead__logotype">Alchemy</span>
                  <span class="masthead__motto">So the Model Holds</span>
                </a>
                <span class="masthead__brand masthead__brand--back" aria-hidden="true">
                  <span class="masthead__logotype">Alchemy</span>
                  <span class="masthead__motto">So the Model Holds</span>
                </span>
              </div>
            </header>

            <nav class="dock-nav" aria-label="Primary">
              <div class="dock-nav__indicator" aria-hidden="true"></div>
              ${chamberLinks}
            </nav>

            <section
              id="chamber-dialog"
              class="overlay overlay--chamber"
              role="dialog"
              aria-modal="true"
              aria-labelledby="chamber-title"
              aria-describedby="chamber-body"
            >
              <div class="overlay__scrim" data-close></div>
              <article class="overlay__surface overlay__surface--chamber" data-panel-surface>
                <button class="overlay__close" type="button" aria-label="Close chamber" data-close>
                  <span aria-hidden="true">&times;</span>
                </button>
                <header class="overlay__header">
                  <p class="overlay__label" id="chamber-label"></p>
                  <h2 class="overlay__title" id="chamber-title"></h2>
                </header>
                <div class="overlay__body" id="chamber-body"></div>
                <footer class="overlay__footer">
                  <p class="overlay__note" id="chamber-note"></p>
                  <a class="overlay__cta" id="chamber-cta" hidden></a>
                </footer>
              </article>
            </section>

            <section
              id="document-dialog"
              class="overlay overlay--document"
              role="dialog"
              aria-modal="true"
              aria-labelledby="document-title"
              aria-describedby="document-body"
            >
              <div class="overlay__scrim" data-close></div>
              <article class="overlay__surface overlay__surface--document" data-panel-surface>
                <button class="overlay__close" type="button" aria-label="Close document" data-close>
                  <span aria-hidden="true">&times;</span>
                </button>
                <header class="overlay__header overlay__header--document">
                  <p class="overlay__label" id="document-kicker"></p>
                  <h2 class="overlay__title" id="document-title"></h2>
                  <p class="overlay__subtitle" id="document-subtitle"></p>
                </header>
                <div class="overlay__body overlay__body--document" id="document-body"></div>
              </article>
            </section>
          </div>
        </section>
      </main>
    </div>
  `;
}

function isSameRoute(left: AppRoute | null, right: AppRoute): boolean {
  if (!left) {
    return false;
  }

  if (left.kind !== right.kind) {
    return false;
  }

  if (left.kind === 'idle') {
    return true;
  }

  if (left.kind === 'chamber' && right.kind === 'chamber') {
    return left.key === right.key;
  }

  if (left.kind === 'document' && right.kind === 'document') {
    return left.id === right.id;
  }

  return false;
}

function isPresentedRoute(route: AppRoute | null): boolean {
  return Boolean(route && route.kind !== 'idle');
}

export class AlchemyApp {
  private readonly router = new HashRouter();
  private readonly shell: HTMLElement;
  private readonly scene: HeroScene | null;
  private readonly nav: DockNav;
  private readonly chamberDialog: DialogController;
  private readonly documentDialog: DialogController;
  private readonly unsubscribeRoute: () => void;
  private readonly elements: {
    home: HTMLAnchorElement;
    noteLinks: HTMLAnchorElement[];
    ambientNote: HTMLElement;
    chamberLabel: HTMLElement;
    chamberTitle: HTMLElement;
    chamberBody: HTMLElement;
    chamberNote: HTMLElement;
    chamberCta: HTMLAnchorElement;
    chamberClose: HTMLElement;
    documentKicker: HTMLElement;
    documentTitle: HTMLElement;
    documentSubtitle: HTMLElement;
    documentBody: HTMLElement;
    documentClose: HTMLElement;
  };
  private activeRoute: AppRoute | null = null;
  private pendingOpener: HTMLElement | null = null;
  private routeWork = Promise.resolve();

  constructor(private readonly container: HTMLElement) {
    this.container.innerHTML = buildTemplate(import.meta.env.BASE_URL);
    const shell = this.container.querySelector<HTMLElement>('.alchemy-shell');
    const canvas = this.container.querySelector<HTMLCanvasElement>('#hero-scene');
    const chamberRoot = this.container.querySelector<HTMLElement>('#chamber-dialog');
    const documentRoot = this.container.querySelector<HTMLElement>('#document-dialog');
    const dockNavRoot = this.container.querySelector<HTMLElement>('.dock-nav');

    if (!shell || !canvas || !chamberRoot || !documentRoot || !dockNavRoot) {
      throw new Error('Alchemy shell failed to mount.');
    }

    this.shell = shell;
    this.elements = {
      home: this.require<HTMLAnchorElement>('[data-home]'),
      noteLinks: Array.from(this.container.querySelectorAll<HTMLAnchorElement>('[data-doc-link]')),
      ambientNote: this.require<HTMLElement>('#ambient-note'),
      chamberLabel: this.require<HTMLElement>('#chamber-label'),
      chamberTitle: this.require<HTMLElement>('#chamber-title'),
      chamberBody: this.require<HTMLElement>('#chamber-body'),
      chamberNote: this.require<HTMLElement>('#chamber-note'),
      chamberCta: this.require<HTMLAnchorElement>('#chamber-cta'),
      chamberClose: this.require<HTMLElement>('#chamber-dialog .overlay__close'),
      documentKicker: this.require<HTMLElement>('#document-kicker'),
      documentTitle: this.require<HTMLElement>('#document-title'),
      documentSubtitle: this.require<HTMLElement>('#document-subtitle'),
      documentBody: this.require<HTMLElement>('#document-body'),
      documentClose: this.require<HTMLElement>('#document-dialog .overlay__close')
    };

    this.nav = new DockNav(dockNavRoot, {
      onNavigate: (key, opener) => {
        this.pendingOpener = opener;
        this.router.navigate({ kind: 'chamber', key });
      }
    });

    this.chamberDialog = new DialogController(chamberRoot, {
      kind: 'chamber',
      initialFocus: () => this.elements.chamberClose,
      fallbackFocus: () => this.nav.getLink('philosophy') ?? this.elements.home,
      onRequestClose: () => this.router.navigate({ kind: 'idle' })
    });

    this.documentDialog = new DialogController(documentRoot, {
      kind: 'document',
      initialFocus: () => this.elements.documentClose,
      fallbackFocus: () => this.elements.noteLinks[0] ?? this.elements.home,
      onRequestClose: () => this.router.navigate({ kind: 'idle' })
    });

    let scene: HeroScene | null = null;
    try {
      scene = new HeroScene(canvas);
      this.shell.dataset.scene = 'interactive';
    } catch (error) {
      console.warn('Falling back to static hero composition.', error);
      this.shell.dataset.scene = 'fallback';
    }
    this.scene = scene;
    this.bind();

    this.unsubscribeRoute = this.router.subscribe((route) => {
      this.routeWork = this.routeWork
        .catch(() => undefined)
        .then(async () => {
          if (isSameRoute(this.activeRoute, route)) {
            return;
          }

          const previousRoute = this.activeRoute;
          this.activeRoute = route;
          await this.commitRoute(route, previousRoute);
        });
    });

    this.router.start();
    void this.finishBoot();
  }

  destroy(): void {
    this.unsubscribeRoute();
    this.router.stop();
    this.nav.destroy();
    this.chamberDialog.destroy();
    this.documentDialog.destroy();
    this.scene?.dispose();
    document.removeEventListener('keydown', this.onKeyDown);
  }

  private bind(): void {
    this.elements.home.addEventListener('click', (event) => {
      event.preventDefault();
      this.pendingOpener = this.elements.home;
      this.router.navigate({ kind: 'idle' });
    });

    this.elements.noteLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.pendingOpener = link;
        this.router.navigate({ kind: 'document', id: 'american-favela' });
      });
    });

    this.elements.chamberCta.addEventListener('click', (event) => {
      if (this.elements.chamberCta.dataset.destination === 'systems-page') {
        event.preventDefault();
        window.location.assign(this.getStandalonePageUrl('systems.html'));
        return;
      }

      event.preventDefault();
      this.pendingOpener = this.elements.chamberCta;
      this.router.navigate({ kind: 'document', id: 'american-favela' });
    });

    document.addEventListener('keydown', this.onKeyDown);
  }

  private async finishBoot(): Promise<void> {
    await waitForFonts();
    this.shell.dataset.ready = 'true';
  }

  private async commitRoute(route: AppRoute, previousRoute: AppRoute | null): Promise<void> {
    if (route.kind === 'chamber') {
      this.renderChamber(route.key);
    }

    if (route.kind === 'document') {
      this.renderDocument(route.id);
    }

    if (route.kind === 'idle') {
      await this.closeDialogs(previousRoute, { restoreFocus: true });
      await withViewTransition(() => {
        this.syncShellState(route);
      }, {
        enabled: isPresentedRoute(previousRoute)
      });

      this.pendingOpener = null;
      return;
    }

    await withViewTransition(() => {
      this.syncShellState(route);
    }, {
      enabled: true
    });

    if (route.kind === 'chamber') {
      await this.transitionToChamber(route, previousRoute);
      this.pendingOpener = null;
      return;
    }

    await this.transitionToDocument(previousRoute);
    this.pendingOpener = null;
  }

  private syncShellState(route: AppRoute): void {
    this.shell.dataset.overlay = route.kind;
    this.shell.dataset.theme = this.resolveTheme(route);
    this.elements.ambientNote.textContent = this.resolveAmbientNote(route);
    this.scene?.setPresentationMode(route.kind === 'idle' ? 'idle' : 'overlay');

    this.elements.noteLinks.forEach((link) => {
      link.dataset.active = String(route.kind === 'document');
    });

    if (route.kind === 'idle') {
      this.nav.setActive(null);
      return;
    }

    if (route.kind === 'chamber') {
      this.nav.setActive(route.key);
      return;
    }

    this.nav.setActive(DOCUMENTS[route.id].theme);
  }

  private async transitionToChamber(route: Extract<AppRoute, { kind: 'chamber' }>, previousRoute: AppRoute | null): Promise<void> {
    const opener = this.pendingOpener ?? this.nav.getLink(route.key);

    if (previousRoute?.kind === 'document') {
      await Promise.all([
        this.documentDialog.close({ restoreFocus: false }),
        this.chamberDialog.open(opener)
      ]);
      return;
    }

    await this.documentDialog.close({ restoreFocus: false });
    await this.chamberDialog.open(opener);
  }

  private async transitionToDocument(previousRoute: AppRoute | null): Promise<void> {
    const opener = this.pendingOpener ?? this.elements.noteLinks[0] ?? this.elements.home;

    if (previousRoute?.kind === 'chamber') {
      await Promise.all([
        this.chamberDialog.close({ restoreFocus: false }),
        this.documentDialog.open(opener)
      ]);
      return;
    }

    await this.chamberDialog.close({ restoreFocus: false });
    await this.documentDialog.open(opener);
  }

  private async closeDialogs(
    previousRoute: AppRoute | null,
    options: { restoreFocus: boolean }
  ): Promise<void> {
    if (previousRoute?.kind === 'document') {
      await Promise.all([
        this.documentDialog.close({ restoreFocus: options.restoreFocus }),
        this.chamberDialog.close({ restoreFocus: false })
      ]);
      return;
    }

    if (previousRoute?.kind === 'chamber') {
      await Promise.all([
        this.chamberDialog.close({ restoreFocus: options.restoreFocus }),
        this.documentDialog.close({ restoreFocus: false })
      ]);
      return;
    }

    await Promise.all([
      this.chamberDialog.close({ restoreFocus: false }),
      this.documentDialog.close({ restoreFocus: false })
    ]);
  }

  private renderChamber(key: ChamberKey): void {
    const chamber = CHAMBERS[key];

    this.elements.chamberLabel.textContent = chamber.label;
    this.elements.chamberTitle.textContent = chamber.title;
    this.elements.chamberNote.textContent = chamber.accentLabel;
    this.elements.chamberBody.dataset.layout = key === 'philosophy' ? 'creed' : 'default';
    this.elements.chamberBody.innerHTML = chamber.paragraphs
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join('');
    this.elements.chamberBody.scrollTop = 0;

    if (key === 'systems') {
      this.elements.chamberCta.hidden = false;
      this.elements.chamberCta.dataset.destination = 'systems-page';
      this.elements.chamberCta.href = this.getStandalonePageUrl('systems.html');
      this.elements.chamberCta.textContent = chamber.ctaLabel ?? 'Open systems page';
      return;
    }

    if (chamber.documentId) {
      this.elements.chamberCta.hidden = false;
      this.elements.chamberCta.dataset.destination = 'document';
      this.elements.chamberCta.href = routeToHash({
        kind: 'document',
        id: chamber.documentId
      });
      this.elements.chamberCta.textContent = chamber.ctaLabel ?? 'Open field note';
    } else {
      this.elements.chamberCta.hidden = true;
      this.elements.chamberCta.dataset.destination = 'none';
      this.elements.chamberCta.removeAttribute('href');
      this.elements.chamberCta.textContent = '';
    }
  }

  private renderDocument(id: DocumentId): void {
    const documentContent = DOCUMENTS[id];

    this.elements.documentKicker.textContent = documentContent.kicker;
    this.elements.documentTitle.textContent = documentContent.title;
    this.elements.documentSubtitle.textContent = documentContent.subtitle;
    this.elements.documentBody.innerHTML = documentContent.sections
      .map(
        (section) => `
          <section class="document-section">
            <h3>${section.heading}</h3>
            ${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}
          </section>
        `
      )
      .join('');
  }

  private resolveTheme(route: AppRoute): ThemeKey {
    if (route.kind === 'chamber') {
      return route.key;
    }

    if (route.kind === 'document') {
      return DOCUMENTS[route.id].theme;
    }

    return 'neutral';
  }

  private resolveAmbientNote(route: AppRoute): string {
    if (route.kind === 'chamber') {
      return CHAMBERS[route.key].note;
    }

    if (route.kind === 'document') {
      return DOCUMENTS[route.id].subtitle;
    }

    return 'A chambered studio for philosophy, systems, artifacts, and oracle work.';
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') {
      return;
    }

    if (this.activeRoute?.kind === 'idle' || !this.activeRoute) {
      return;
    }

    this.router.navigate({ kind: 'idle' });
  };

  private getStandalonePageUrl(path: string): string {
    const url = new URL(path, window.location.href);
    url.search = window.location.search;
    url.hash = '';
    return url.toString();
  }

  private require<T extends HTMLElement>(selector: string): T {
    const node = this.container.querySelector<T>(selector);
    if (!node) {
      throw new Error(`Required element not found: ${selector}`);
    }
    return node;
  }
}
