import './styles/systems-page.css';
import { SYSTEM_LINKS } from './content/systems';

function buildCards(): string {
  return SYSTEM_LINKS.map((system) => {
    const domain = new URL(system.href).hostname.replace(/^www\./, '');

    return `
      <a class="program-card" href="${system.href}" target="_blank" rel="noreferrer">
        <div class="program-card__meta">
          <span class="program-card__category">${system.category}</span>
          <span class="program-card__tag">${system.tagline}</span>
        </div>
        <h2 class="program-card__name">${system.name}</h2>
        <p class="program-card__domain">${domain}</p>
        <p class="program-card__description">${system.description}</p>
        <span class="program-card__cta">Visit program</span>
      </a>
    `;
  }).join('');
}

function buildPage(homeHref: string): string {
  return `
    <div class="programs-shell">
      <div class="programs-shell__wash" aria-hidden="true"></div>
      <div class="programs-shell__grain" aria-hidden="true"></div>

      <header class="programs-topbar">
        <a class="programs-topbar__home" href="${homeHref}">Alchemy</a>
        <a class="programs-topbar__back" href="${homeHref}">Back to home</a>
      </header>

      <main class="programs-main">
        <section class="programs-hero" aria-labelledby="programs-title">
          <p class="programs-hero__eyebrow">Programs</p>
          <h1 class="programs-hero__title" id="programs-title">
            A separate page for the programs, software, and SaaS you want to showcase.
          </h1>
          <p class="programs-hero__copy">
            This is the standalone systems page linked from the Systems chamber. Start with ExamCove and expand the catalog from here.
          </p>
        </section>

        <section class="programs-grid" aria-label="Program directory">
          ${buildCards()}
        </section>
      </main>
    </div>
  `;
}

const appRoot = document.querySelector<HTMLElement>('#app');

if (!appRoot) {
  throw new Error('Missing app root.');
}

appRoot.innerHTML = buildPage(import.meta.env.BASE_URL);
