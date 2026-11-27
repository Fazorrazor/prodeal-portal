#!/usr/bin/env node
/**
 * Multi-Gate Pre-Push Security & Quality Verification Suite (`npm run verify`)
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const steps = [
  {
    name: 'TypeScript Typecheck (tsc --noEmit)',
    command: 'npx',
    args: ['tsc', '--noEmit'],
  },
  {
    name: 'Unit & Security Regression Suite (vitest)',
    command: 'npx',
    args: ['vitest', 'run'],
  },
  {
    name: 'Supply-Chain & Repo Anomaly Vet',
    command: 'node',
    args: ['scripts/vet-repo.mjs', '--self'],
  },
  {
    name: 'Agent Skills Supply-Chain Vet',
    command: 'node',
    args: ['scripts/vet-repo.mjs', '--skills'],
  },
];

console.log('================================================================');
console.log(' PRO DEAL PORTAL — MULTI-GATE SECURITY & QUALITY VERIFICATION');
console.log('================================================================\n');

const results = [];
const overallStart = Date.now();
let allPassed = true;

for (let i = 0; i < steps.length; i++) {
  const step = steps[i];
  process.stdout.write(`[${i + 1}/${steps.length}] Running ${step.name}... `);
  const start = Date.now();

  const res = spawnSync(step.command, step.args, {
    cwd: projectRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: { ...process.env },
  });

  const duration = ((Date.now() - start) / 1000).toFixed(1);

  if (res.status === 0) {
    console.log(`PASS (${duration}s)`);
    results.push({ name: step.name, status: 'PASS', duration: `${duration}s` });
  } else {
    console.log(`FAILED (${duration}s)`);
    results.push({ name: step.name, status: 'FAIL', duration: `${duration}s` });
    if (res.stdout) console.log('\n--- OUTPUT ---\n' + res.stdout.trim());
    if (res.stderr) console.error('\n--- ERROR ---\n' + res.stderr.trim());
    allPassed = false;
    break;
  }
}

const totalDuration = ((Date.now() - overallStart) / 1000).toFixed(1);

console.log('\n================================================================');
console.log(' VERIFICATION SUMMARY');
console.log('================================================================');
for (const r of results) {
  const symbol = r.status === 'PASS' ? 'PASS' : 'FAIL';
  console.log(` [${symbol}] ${r.name.padEnd(44)} (${r.duration})`);
}
console.log('----------------------------------------------------------------');
if (allPassed) {
  console.log(` SUCCESS: All ${steps.length} quality gates passed cleanly in ${totalDuration}s.\n`);
  process.exit(0);
} else {
  console.log(' FAILED: Security/quality gate failed. Push blocked.\n');
  process.exit(1);
}
