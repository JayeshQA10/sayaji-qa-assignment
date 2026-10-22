const { test, expect } = require('@playwright/test');
const path = require('node:path');

test.describe('schema-driven visibility: hobby question', () => {
  test('q4 is hidden until q3 = Yes, then becomes visible', async ({ page }) => {
    const fileUrl = 'file://' + path.resolve(__dirname, 'dynamic-survey-fixture.html');
    await page.goto(fileUrl);

    const q4 = page.getByTestId('q4-wrapper');
    const q3 = page.getByTestId('q3');

    await expect(q4).toBeHidden();

    await q3.selectOption('No');
    await expect(q4).toBeHidden();

    await q3.selectOption('Yes');
    await expect(q4).toBeVisible();
    await expect(page.getByTestId('q4')).toBeEditable();
  });
});
