import { expect, test } from 'playwright/test';

const componentName = 'lfp-scroll-nav';
const testPath = '/tests/ScrollNav';

test.describe(`<${componentName}>`, () => {
  test('has scroll container element', async ({ page }) => {
    await page.goto(`${testPath}/default.html`);

    const component = page.locator(componentName);
    await expect(component).toBeAttached();
    
    const scrollContainer = component.locator(`[scroll-container]`);
    expect(scrollContainer).toBeDefined();
  });
  
  test('has previous button', async ({ page }) => {
    await page.goto(`${testPath}/default.html`);
  
    const component = page.locator(componentName);
    await expect(component).toBeAttached();

    const previousBtn = component.locator('button:first-of-type');
    expect(previousBtn).toBeDefined();
  });

  test('has next button', async ({ page }) => {
    await page.goto(`${testPath}/default.html`);

    const component = page.locator(componentName);
    await expect(component).toBeAttached();

    const nextBtn = component.locator('button:last-of-type');
    expect(nextBtn).toBeDefined();
  });
});