import { test, expect } from '@playwright/test';

test.describe('Pro Deal Industries - Critical Smoke Tests', () => {
  
  test('Homepage loads correctly without 500 errors', async ({ page }) => {
    const maxRetries = 5;
    let response;
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        response = await page.goto('/', { waitUntil: 'networkidle' });
        console.log(`[Attempt ${i + 1}] URL: ${response?.url()} - Status: ${response?.status()}`);
        if (response?.status() === 200) break;
      } catch (e) {
        lastError = e;
        if (i < maxRetries - 1) {
          await page.waitForTimeout(2000);
        }
      }
    }
    
    if (!response) {
      throw lastError || new Error('Failed to load homepage after retries');
    }
    
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Chemicals division is accessible', async ({ page }) => {
    const maxRetries = 5;
    let response;
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        response = await page.goto('/divisions/chemicals', { waitUntil: 'networkidle' });
        console.log(`[Attempt ${i + 1}] URL: ${response?.url()} - Status: ${response?.status()}`);
        if (response?.ok()) break;
      } catch (e) {
        lastError = e;
        if (i < maxRetries - 1) {
          await page.waitForTimeout(2000);
        }
      }
    }
    
    if (!response) {
      throw lastError || new Error('Failed to load chemicals division after retries');
    }
    
    expect(response.ok()).toBeTruthy();
  });

});
