import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { validateServerEnv } from '../lib/env';
import { evaluateHealthChecks } from '../lib/health';

const ROOT = process.cwd();

describe('Typed Environment Contract (lib/env.ts)', () => {
  test('accepts valid required env variables and reports ok', () => {
    const res = validateServerEnv({
      NODE_ENV: 'development',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-placeholder',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-placeholder',
    });

    expect(res.ok).toBe(true);
    expect(res.missingRequired).toEqual([]);
    expect(res.invalidFields).toEqual([]);
  });

  test('flags missing required variables and malformed URLs without leaking secret values', () => {
    const res = validateServerEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: 'not-a-valid-url',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
      SUPABASE_SERVICE_ROLE_KEY: 'super-secret-value-never-leak',
    });

    expect(res.ok).toBe(false);
    expect(res.missingRequired).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    expect(res.invalidFields).toContain('NEXT_PUBLIC_SUPABASE_URL');
    expect(JSON.stringify(res)).not.toContain('super-secret-value-never-leak');
  });

  test('warns in production when Upstash or Admin Subdomain isolation env vars are absent', () => {
    const res = validateServerEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-placeholder',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-placeholder',
    });

    expect(res.ok).toBe(true);
    expect(res.warnings.some((w) => w.includes('ADMIN_SUBDOMAIN_HOST'))).toBe(true);
    expect(res.warnings.some((w) => w.includes('UPSTASH_REDIS_REST_URL'))).toBe(true);
  });
});

describe('Deep Health Readiness Check (lib/health.ts)', () => {
  test('returns 200 ok when env and database ping succeed', async () => {
    const res = await evaluateHealthChecks({
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'service-key',
        ADMIN_SUBDOMAIN_HOST: 'desk.prodealindustries.com',
        UPSTASH_REDIS_REST_URL: 'https://redis.upstash.io',
        UPSTASH_REDIS_REST_TOKEN: 'token',
      },
      pingDatabase: async () => true,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.checks).toEqual({ env: 'ok', database: 'ok' });
    expect(typeof res.body.timestamp).toBe('string');
  });

  test('returns 503 degraded without leaking raw DB errors when database check fails', async () => {
    const res = await evaluateHealthChecks({
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'service-key',
      },
      pingDatabase: async () => {
        throw new Error('FATAL: password authentication failed for user postgres@10.0.0.5');
      },
    });

    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.checks).toEqual({ env: 'ok', database: 'degraded' });
    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toContain('password');
    expect(serialized).not.toContain('10.0.0.5');
  });

  test('returns 503 degraded and skips database ping when required env is missing', async () => {
    let pingCalled = false;
    const res = await evaluateHealthChecks({
      env: { NODE_ENV: 'production' },
      pingDatabase: async () => {
        pingCalled = true;
        return true;
      },
    });

    expect(pingCalled).toBe(false);
    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.checks).toEqual({ env: 'degraded', database: 'skipped' });
    expect(JSON.stringify(res.body)).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  test('times out hung database pings cleanly into 503 degraded', async () => {
    const res = await evaluateHealthChecks({
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'service-key',
      },
      timeoutMs: 25,
      pingDatabase: () => new Promise<boolean>(() => {}),
    });

    expect(res.statusCode).toBe(503);
    expect(res.body.checks.database).toBe('degraded');
  });
});

describe('Workflow, Error Boundaries & Repo Hygiene Guards', () => {
  test('app/error.tsx and app/global-error.tsx exist, are client boundaries, and never expose stack traces', () => {
    for (const rel of ['app/error.tsx', 'app/global-error.tsx']) {
      const full = path.join(ROOT, rel);
      expect(fs.existsSync(full), `Missing ${rel}`).toBe(true);
      const src = fs.readFileSync(full, 'utf8');
      expect(src.trimStart().startsWith("'use client'")).toBe(true);
      expect(src).not.toContain('error.stack');
      expect(src).not.toContain('{error.message}');
      expect(src).toContain('reset');
    }
  });

  test('.husky/pre-push enforces npm run verify and Dependabot covers npm + github-actions', () => {
    const prePush = fs.readFileSync(path.join(ROOT, '.husky/pre-push'), 'utf8');
    expect(prePush).toContain('npm run verify');

    const dependabot = fs.readFileSync(path.join(ROOT, '.github/dependabot.yml'), 'utf8');
    expect(dependabot).toContain('package-ecosystem: "npm"');
    expect(dependabot).toContain('package-ecosystem: "github-actions"');
  });

  test('.env.example documents required keys without secrets and is un-ignored in .gitignore', () => {
    const envExample = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8');
    expect(envExample).toContain('NEXT_PUBLIC_SUPABASE_URL=');
    expect(envExample).toContain('ADMIN_SUBDOMAIN_HOST=');
    expect(envExample).toContain('UPSTASH_REDIS_REST_URL=');
    expect(envExample).not.toMatch(/re_[A-Za-z0-9]{20,}/);
    expect(envExample).not.toMatch(/eyJhbGciOi/);

    const gitignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
    expect(gitignore).toContain('!.env.example');
  });

  test('Playwright smoke tests avoid hardcoded waitForTimeout sleeps', () => {
    const smokeSrc = fs.readFileSync(path.join(ROOT, 'tests/smoke.spec.ts'), 'utf8');
    expect(smokeSrc).not.toContain('waitForTimeout');
  });
});

describe('Google Search Console & SEO Hygiene Guards', () => {
  test('app/sitemap.ts uses explicit content dates and excludes /track, /admin, /ops, and inactive divisions', async () => {
    const sitemapSrc = fs.readFileSync(path.join(ROOT, 'app/sitemap.ts'), 'utf8');
    expect(sitemapSrc).not.toMatch(/new Date\(\s*\)/);

    const { default: sitemap } = await import('../app/sitemap');
    const entries = sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain('https://www.prodealindustries.com');
    expect(urls).toContain('https://www.prodealindustries.com/divisions/chemicals');
    expect(urls).toContain('https://www.prodealindustries.com/divisions/bowls');
    expect(urls).toContain('https://www.prodealindustries.com/solutions');

    expect(urls).not.toContain('https://www.prodealindustries.com/track');
    expect(urls).not.toContain('https://www.prodealindustries.com/divisions/signages');
    expect(urls).not.toContain('https://www.prodealindustries.com/divisions/printing');
    expect(urls.some((u) => u.includes('/admin') || u.includes('/ops'))).toBe(false);
  });

  test('proxy.ts serves Disallow: / on admin subdomain robots.txt and 404 on admin subdomain sitemap.xml', () => {
    const proxySrc = fs.readFileSync(path.join(ROOT, 'proxy.ts'), 'utf8');
    expect(proxySrc).toContain("lowerPath === '/robots.txt'");
    expect(proxySrc).toContain('Disallow: /');
    expect(proxySrc).toContain("lowerPath === '/sitemap.xml'");
  });

  test('private receipt page declares explicit noindex metadata', () => {
    const receiptSrc = fs.readFileSync(path.join(ROOT, 'app/(public)/inquiry/success/page.tsx'), 'utf8');
    expect(receiptSrc).toContain('index: false');
  });

  test('removed Track Inquiry, calculator, estimator, and quick RFQ surfaces stay deleted', () => {
    const removedPaths = [
      'app/(public)/track',
      'components/track',
      'app/api/inquiries',
      'components/division/chemicals/ChemicalCoverageCalculator.tsx',
      'components/division/disposable-bowls/BowlsCartonCalculator.tsx',
      'components/shared/QuickRfqButton.tsx',
      'components/shared/RfqTray.tsx',
      'lib/store/rfqStore.ts',
    ];
    for (const rel of removedPaths) {
      expect(fs.existsSync(path.join(ROOT, rel)), `Expected ${rel} to remain removed`).toBe(false);
    }

    const navSrc = fs.readFileSync(path.join(ROOT, 'lib/config/navigation.ts'), 'utf8');
    expect(navSrc).not.toContain('/track');
    expect(navSrc).not.toContain('Track Inquiry');

    const footerSrc = fs.readFileSync(path.join(ROOT, 'components/layout/FooterLinks.tsx'), 'utf8');
    expect(footerSrc).not.toContain('/track');

    const layoutSrc = fs.readFileSync(path.join(ROOT, 'app/layout.tsx'), 'utf8');
    expect(layoutSrc).not.toContain('RfqTray');
  });

  test('indexable static public routes declare explicit canonical URLs', () => {
    const expectedCanonicals: Array<[string, string]> = [
      ['app/(public)/inquiry/page.tsx', 'https://www.prodealindustries.com/inquiry'],
      ['app/(public)/support/layout.tsx', 'https://www.prodealindustries.com/support'],
      ['app/(public)/privacy/page.tsx', 'https://www.prodealindustries.com/privacy'],
      ['app/(public)/terms/page.tsx', 'https://www.prodealindustries.com/terms'],
      ['app/(public)/accessibility/page.tsx', 'https://www.prodealindustries.com/accessibility'],
    ];
    for (const [rel, canonical] of expectedCanonicals) {
      const full = path.join(ROOT, rel);
      expect(fs.existsSync(full), `Missing ${rel}`).toBe(true);
      const src = fs.readFileSync(full, 'utf8');
      expect(src).toContain(canonical);
    }
  });

  test('scripts/submit-indexnow.mjs excludes inactive divisions and /track', () => {
    const indexNowSrc = fs.readFileSync(path.join(ROOT, 'scripts/submit-indexnow.mjs'), 'utf8');
    expect(indexNowSrc).toContain('/divisions/chemicals');
    expect(indexNowSrc).toContain('/divisions/bowls');
    expect(indexNowSrc).not.toContain('/divisions/signages');
    expect(indexNowSrc).not.toContain('/divisions/printing');
    expect(indexNowSrc).not.toContain('/track');
  });
});
