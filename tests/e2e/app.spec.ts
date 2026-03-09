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
  await load(page, '?test-mode=1#doc/design-intent');

  await expect(page.locator('#document-title')).toHaveText('Design Intent');
  await expect(page.locator('.dock-nav__link[data-chamber="artifacts"]')).toHaveAttribute(
    'data-active',
    'true'
  );
  await expect(page).toHaveScreenshot('document-depth.png', {
    fullPage: true,
    animations: 'disabled'
  });
});

test('routes the systems chamber CTA to a standalone programs page', async ({
  page
}) => {
  await load(page, '?test-mode=1');

  const systemsLink = page.locator('.dock-nav__link[data-chamber="systems"]');
  await systemsLink.focus();
  await systemsLink.press('Enter');

  await expect(page.locator('#chamber-title')).toHaveText('The architecture that carries the weight.');
  await expect(page.locator('#chamber-cta')).toHaveText('Open systems page');

  await page.locator('#chamber-cta').click();

  await expect(page).toHaveURL(/systems\.html\?test-mode=1$/);
  await expect(page.locator('.programs-hero__title')).toHaveText(
    'A separate page for the programs, software, and SaaS you want to showcase.'
  );
  await expect(page.locator('.program-card')).toContainText('ExamCove');
  await expect(page.locator('.program-card')).toHaveAttribute('href', /examcove\.com/);
});

test('transitions from chamber to document and back to idle with stable focus', async ({
  page
}) => {
  await load(page, '?test-mode=1');

  const homeLink = page.locator('[data-home]');
  const artifactsLink = page.locator('.dock-nav__link[data-chamber="artifacts"]');
  await artifactsLink.focus();
  await artifactsLink.press('Enter');

  const chamberCta = page.locator('#chamber-cta');
  await expect(chamberCta).toBeVisible();
  await chamberCta.click();

  await expect(page.locator('#chamber-dialog')).toBeHidden();
  await expect(page.locator('#document-title')).toHaveText('Design Intent');
  await expect(page.locator('.dock-nav__link[data-chamber="artifacts"]')).toHaveAttribute(
    'data-active',
    'true'
  );
  await expect(page.locator('#document-dialog .overlay__close')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.locator('#document-dialog')).toBeHidden();
  await expect(homeLink).toBeFocused();
});
