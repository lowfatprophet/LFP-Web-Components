import { expect, test } from 'playwright/test';

const componentName = 'lfp-scroll-nav';
const testPath = '/tests/ScrollNav';

test.describe(`<${componentName}>`, () => {
  test('has correct layout', async ({ page }) => {
    await page.goto(`${testPath}/default.html`);

    // component exists
    const wc = page.locator(componentName);
    await expect(wc).toBeAttached();
    
    // scroll container exists
    const scrollContainer = wc.locator(`[scroll-container]`);
    expect(scrollContainer).toHaveAttribute('scroll-container');

    // proper link count
    const linkCount = await scrollContainer.locator('li').count();
    expect(linkCount).toBe(5);

    const immediateChildren = wc.locator('> *');

    // check if first child is button with correct layout
    expect(immediateChildren.first()).toHaveAttribute('data-trigger');
    expect(immediateChildren.first()).toHaveText('❮');

    // check if last child is button with correct layout
    expect(immediateChildren.last()).toHaveAttribute('data-trigger');
    expect(immediateChildren.last()).toHaveText('❯');

    const componentWidth = (await wc.boundingBox())?.width;
    const scrollContainerWidth = (await scrollContainer.boundingBox())?.width;

    if (componentWidth && scrollContainerWidth) {
      // if component width is smaller than scroll container width
      // the second button is expected to not be disabled to enable scrolling.
      if (componentWidth < scrollContainerWidth) {
        expect(immediateChildren.last()).not.toHaveAttribute('disabled');
      } else {
        expect(immediateChildren.last()).toHaveAttribute('disabled');
      }
    }
  });
});