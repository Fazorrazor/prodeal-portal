import { test, expect } from '@playwright/test';

test.describe('Pro Deal Industries - Critical Smoke Tests', () => {
  
  test('Homepage loads correctly without 500 errors', async ({ page }) => {
    const maxRetries = 5;
    let response;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        response = await page.goto('/');
        if (response?.status() === 200) break;
      } catch (e) {
        if (i === maxRetries - 1) throw e;
        await page.waitForTimeout(2000);
      }
    }
    
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Chemicals division is accessible', async ({ page }) => {
    const maxRetries = 5;
    let response;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        response = await page.goto('/divisions/chemicals');
        if (response?.ok()) break;
      } catch (e) {
        if (i === maxRetries - 1) throw e;
        await page.waitForTimeout(2000);
      }
    }
    
    expect(response?.ok()).toBeTruthy();
  });

});
