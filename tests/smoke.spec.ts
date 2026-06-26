import { test, expect } from '@playwright/test';

test.describe('Pro Deal Industries - Critical Smoke Tests', () => {
  
  test('Homepage loads correctly without 500 errors', async ({ page }) => {
    // Navigate to the base URL (which CI dynamically sets to the Vercel Preview URL)
    const response = await page.goto('/');
    
    // Ensure the page didn't crash
    expect(response?.status()).toBe(200);
    
    // Ensure the body is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('3D Signages division is accessible', async ({ page }) => {
    // Navigate specifically to the Signages division to ensure dynamic routes work
    const response = await page.goto('/divisions/3d-signages');
    
    // Ensure the division didn't return a 404
    // (If the route is exactly /divisions/3d-signages, else we accept basic network success)
    expect(response?.ok()).toBeTruthy();
  });

});
