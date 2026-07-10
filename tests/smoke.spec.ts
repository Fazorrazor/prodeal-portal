import { test, expect } from '@playwright/test';

test.describe('Pro Deal Industries - Critical Smoke Tests', () => {
  
  test('Homepage loads correctly without 500 errors', async ({ page }) => {
    const maxRetries = 5;
    let response;
    let lastError;
    let success = false;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        response = await page.goto('/', { waitUntil: 'networkidle' });
        console.log(`[Attempt ${i + 1}] URL: ${response?.url()} - Status: ${response?.status()}`);
        if (response?.status() === 200) {
          success = true;
          break;
        } else {
          // If it's a non-200 status (like 404 or 502), Playwright doesn't throw. 
          // We need to manually wait and retry.
          if (i < maxRetries - 1) await page.waitForTimeout(2000);
        }
      } catch (e) {
        lastError = e;
        if (i < maxRetries - 1) {
          await page.waitForTimeout(2000);
        }
      }
    }
    
    if (!success) {
      throw lastError || new Error(`Failed to load homepage after ${maxRetries} retries. Last status: ${response?.status()}`);
    }
    
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Chemicals division is accessible', async ({ page }) => {
    const maxRetries = 5;
    let response;
    let lastError;
    let success = false;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        response = await page.goto('/divisions/chemicals', { waitUntil: 'networkidle' });
        console.log(`[Attempt ${i + 1}] URL: ${response?.url()} - Status: ${response?.status()}`);
        if (response?.ok()) {
          success = true;
          break;
        } else {
          if (i < maxRetries - 1) await page.waitForTimeout(2000);
        }
      } catch (e) {
        lastError = e;
        if (i < maxRetries - 1) {
          await page.waitForTimeout(2000);
        }
      }
    }
    
    if (!success) {
      throw lastError || new Error(`Failed to load chemicals division after ${maxRetries} retries. Last status: ${response?.status()}`);
    }
    
    expect(response?.ok()).toBeTruthy();
  });

});
