import { beforeEach, describe, expect, it } from 'vitest';
import { DialogController } from '../../src/ui/panel';

describe('DialogController', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('opens, traps focus, and restores focus to the opener', async () => {
    document.body.innerHTML = `
      <button id="opener">Open</button>
      <section id="dialog" aria-hidden="true">
        <div class="overlay__scrim" data-close></div>
        <article data-panel-surface>
          <button id="close">Close</button>
          <a id="cta" href="#doc/design-intent">Read note</a>
        </article>
      </section>
    `;

    const opener = document.querySelector<HTMLButtonElement>('#opener');
    const dialogRoot = document.querySelector<HTMLElement>('#dialog');
    const closeButton = document.querySelector<HTMLButtonElement>('#close');
    const cta = document.querySelector<HTMLAnchorElement>('#cta');

    if (!opener || !dialogRoot || !closeButton || !cta) {
      throw new Error('Test DOM did not mount.');
    }

    const controller = new DialogController(dialogRoot, {
      initialFocus: () => closeButton,
      fallbackFocus: () => opener,
      onRequestClose: () => {
        void controller.close();
      }
    });

    opener.focus();
    await controller.open(opener);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(dialogRoot.hidden).toBe(false);
    expect(dialogRoot.getAttribute('aria-hidden')).toBe('false');
    expect(document.activeElement).toBe(closeButton);

    closeButton.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true
      })
    );

    expect(document.activeElement).toBe(cta);

    cta.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true
      })
    );

    expect(document.activeElement).toBe(closeButton);

    await controller.close();
    expect(dialogRoot.hidden).toBe(true);
    expect(document.activeElement).toBe(opener);
  });
});
