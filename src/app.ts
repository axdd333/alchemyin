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

  const fieldNoteRoute = routeToHash({ kind: 'document', id: 'american-favela' });

  return `
    <div
      class="alchemy-shell"
      data-ready="false"
      data-theme="neutral"
      data-overlay="idle"
      style="--asset-hero-base:url('${assetBase}media/alchemy-hero-base.svg');--asset-hero-ornament:url('${assetBase}media/alchemy-ornament.svg')"
    >
      <div class="alchemy-shell__wash" aria-hidden="true"></div>
      <div class="alchemy-shell__grain" aria-hidden="true"></div>

      <div class="loading-veil" aria-hidden="true">
        <div class="loading-veil__mark">
          <span class="loading-veil__sigil"></span>
          <span class="loading-veil__label">Composing the chamber</span>
        </div>
      </div>

      <header class="masthead">
        <div class="masthead__capsule">
          <p class="masthead__eyebrow">Institute for tools, infrastructure, and strange-weather artifacts</p>
          <a href="#" class="masthead__brand" data-home>
            <span class="masthead__logotype">Alchemy</span>
            <span class="masthead__motto">So the Model Holds</span>
          </a>
        </div>
      </header>

      <main class="stage">
        <aside class="info-rail info-rail--left" aria-label="Alchemy method">
          <article class="info-card">
            <p class="info-card__eyebrow">Operational doctrine</p>
            <p class="info-card__copy">
              Tools should remain legible under pressure, and beautiful enough to trust twice.
            </p>
            <div class="info-card__chips" role="list">
              <span role="listitem">Precision systems</span>
              <span role="listitem">Disciplined tooling</span>
              <span role="listitem">Living artifacts</span>
            </div>
          </article>
        </aside>

        <section class="hero">
          <div class="hero__frame" aria-label="Alchemy core environment">
            <div class="hero__paper" aria-hidden="true"></div>
            <div class="hero__mesh" aria-hidden="true"></div>
            <div class="hero__ornament" aria-hidden="true"></div>
            <div class="hero__axis" aria-hidden="true"></div>
            <img class="hero__artwork" src="${assetBase}media/alchemy-hero-base.svg" alt="" aria-hidden="true">
            <canvas id="hero-scene" class="hero__scene" aria-hidden="true"></canvas>

            <div class="hero__caption">
              <p class="hero__kicker" id="ambient-note">
                A chambered studio for philosophy, systems, artifacts, and oracle work.
              </p>
              <a href="${fieldNoteRoute}" class="hero__document-link" data-doc-link>
                Read field note
              </a>
            </div>

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

        <aside class="info-rail info-rail--right" aria-label="Field note">
          <article class="info-card info-card--note field-note-card" id="field-note-card">
            <p class="info-card__eyebrow">Field note</p>
            <h2 class="info-card__title">The American Favela Thesis</h2>
            <p class="info-card__copy">
              Notes on infrastructure, precarity, and tools that do not assume stability.
            </p>
            <a href="${fieldNoteRoute}" class="info-card__action" data-doc-link>
              Open dossier
            </a>
          </article>
        </aside>
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
    fieldNoteCard: HTMLElement;
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
      fieldNoteCard: this.require<HTMLElement>('#field-note-card'),
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
      initialFocus: () => this.elements.chamberClose,
      fallbackFocus: () => this.nav.getLink('philosophy') ?? this.elements.home,
      onRequestClose: () => this.router.navigate({ kind: 'idle' })
    });

    this.documentDialog = new DialogController(documentRoot, {
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

          this.activeRoute = route;
          await withViewTransition(() => {
            this.commitRoute(route);
          });
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

  private commitRoute(route: AppRoute): void {
    this.shell.dataset.overlay = route.kind;
    this.shell.dataset.theme = this.resolveTheme(route);
    this.elements.ambientNote.textContent = this.resolveAmbientNote(route);

    this.elements.noteLinks.forEach((link) => {
      link.dataset.active = String(route.kind === 'document');
    });
    this.elements.fieldNoteCard.dataset.active = String(route.kind === 'document');

    if (route.kind === 'idle') {
      this.nav.setActive(null);
      this.chamberDialog.close({ restoreFocus: true });
      this.documentDialog.close({ restoreFocus: true });
      this.pendingOpener = null;
      return;
    }

    if (route.kind === 'chamber') {
      this.renderChamber(route.key);
      this.nav.setActive(route.key);
      this.documentDialog.close({ restoreFocus: false });
      this.chamberDialog.open(this.pendingOpener ?? this.nav.getLink(route.key));
      this.pendingOpener = null;
      return;
    }

    const documentContent = DOCUMENTS[route.id];
    this.renderDocument(route.id);
    this.nav.setActive(documentContent.theme);
    this.chamberDialog.close({ restoreFocus: false });
    this.documentDialog.open(this.pendingOpener ?? this.elements.noteLinks[0] ?? this.elements.home);
    this.pendingOpener = null;
  }

  private renderChamber(key: ChamberKey): void {
    const chamber = CHAMBERS[key];

    this.elements.chamberLabel.textContent = chamber.label;
    this.elements.chamberTitle.textContent = chamber.title;
    this.elements.chamberNote.textContent = chamber.accentLabel;
    this.elements.chamberBody.innerHTML = chamber.paragraphs
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join('');

    if (chamber.documentId) {
      this.elements.chamberCta.hidden = false;
      this.elements.chamberCta.href = routeToHash({
        kind: 'document',
        id: chamber.documentId
      });
      this.elements.chamberCta.textContent = chamber.ctaLabel ?? 'Open field note';
    } else {
      this.elements.chamberCta.hidden = true;
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

  private require<T extends HTMLElement>(selector: string): T {
    const node = this.container.querySelector<T>(selector);
    if (!node) {
      throw new Error(`Required element not found: ${selector}`);
    }
    return node;
  }
}
