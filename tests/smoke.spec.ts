import { test, expect } from '@playwright/test';

test.describe('Pro Deal Industries — Critical Smoke & Security E2E', () => {
  test('@smoke homepage renders core content with zero uncaught page errors', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/Prodeal Industries/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('@smoke active industrial divisions load cleanly', async ({ page }) => {
    for (const slug of ['chemicals', 'bowls']) {
      const response = await page.goto(`/divisions/${slug}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `/divisions/${slug} HTTP status`).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });

  test('@smoke /api/health verifies runtime & database readiness with no-store headers', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toContain('no-store');

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.checks).toEqual({ env: 'ok', database: 'ok' });
  });

  test('@critical B2B inquiry, tracking, and support pages render without crashes', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    for (const route of ['/inquiry', '/track', '/support']) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `${route} HTTP status`).toBe(200);
      await expect(page.getByRole('heading').first()).toBeVisible();
    }

    expect(pageErrors).toEqual([]);
  });

  test('@security decommissioned /ops & /api/chat return 404 and admin APIs reject unauthenticated access', async ({
    request,
  }) => {
    const opsRes = await request.get('/ops');
    expect(opsRes.status()).toBe(404);

    const chatRes = await request.post('/api/chat', { data: { message: 'probe' } });
    expect(chatRes.status()).toBe(404);

    // Unauthenticated admin API must return 401 (on admin/dev host) or 404 (on isolated public host), never 200
    const adminStaffRes = await request.get('/api/admin/staff');
    expect([401, 404]).toContain(adminStaffRes.status());
  });
});
