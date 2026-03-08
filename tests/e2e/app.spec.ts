import { expect, test } from '@playwright/test';

async function load(page: import('@playwright/test').Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForSelector('.alchemy-shell[data-ready="true"]');
  await page.evaluate(async () => {
    if ('fonts' in document) {
      await document.fonts.ready;
    }
  });
}

test('renders the idle home composition', async ({ page }) => {
  await load(page, '?test-mode=1');
  await expect(page.locator('.dock-nav__link[data-active="true"]')).toHaveCount(0);
  await expect(page).toHaveScreenshot('home-idle.png', {
    fullPage: true,
    animations: 'disabled'
  });
});

test('keeps chamber routing and keyboard focus behavior intact', async ({ page }) => {
  await load(page, '?test-mode=1');

  const artifactsLink = page.locator('.dock-nav__link[data-chamber="artifacts"]');
  await artifactsLink.focus();
  await artifactsLink.press('Enter');

  await expect(page.locator('#chamber-title')).toHaveText(
    'Surfaces built to survive strange weather.'
  );
  await expect(page).toHaveScreenshot('chamber-artifacts.png', {
    fullPage: true,
    animations: 'disabled'
  });

  await expect(page.locator('#chamber-dialog .overlay__close')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#chamber-cta')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#chamber-dialog .overlay__close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#chamber-dialog')).toBeHidden();
  await expect(artifactsLink).toBeFocused();
});

test('supports direct document routes', async ({ page }) => {
  await load(page, '?test-mode=1#doc/american-favela');

  await expect(page.locator('#document-title')).toHaveText('The American Favela Thesis');
  await expect(page.locator('.dock-nav__link[data-chamber="artifacts"]')).toHaveAttribute(
    'data-active',
    'true'
  );
  await expect(page).toHaveScreenshot('document-depth.png', {
    fullPage: true,
    animations: 'disabled'
  });
});
