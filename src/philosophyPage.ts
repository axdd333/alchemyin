import './styles/philosophy-page.css';
import { CREED } from './content/creed';

function buildStanzas(): string {
  return CREED.stanzas
    .map(
      (stanza, index) => `
      <div class="creed-stanza" style="--stanza-index: ${index}">
        ${stanza.map((line) => `<p class="creed-stanza__line">${line}</p>`).join('')}
      </div>
    `
    )
    .join('');
}

function buildPage(homeHref: string): string {
  return `
    <div class="philosophy-shell">
      <div class="philosophy-shell__wash" aria-hidden="true"></div>
      <div class="philosophy-shell__grain" aria-hidden="true"></div>

      <header class="philosophy-topbar">
        <a class="philosophy-topbar__home" href="${homeHref}">Alchemy</a>
        <a class="philosophy-topbar__back" href="${homeHref}">Back to home</a>
      </header>

      <main class="philosophy-main">
        <section class="philosophy-hero" aria-labelledby="philosophy-title">
          <p class="philosophy-hero__eyebrow">Philosophy</p>
          <h1 class="philosophy-hero__title" id="philosophy-title">${CREED.title}</h1>
          <p class="philosophy-hero__note">${CREED.note}</p>
        </section>

        <section class="philosophy-creed" aria-label="The creed">
          ${buildStanzas()}
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
