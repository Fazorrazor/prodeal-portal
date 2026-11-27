#!/usr/bin/env node
/**
 * Fast Staged File Quality, Syntax & Supply-Chain Pre-Commit Guard
 * Executed by lint-staged during Husky pre-commit.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const files = process.argv.slice(2);

if (files.length === 0) {
  process.exit(0);
}

let hasError = false;
const CONFLICT_MARKER_REGEX = /^(<{7}|={7}|>{7})(\s|$)/m;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const stat = fs.statSync(file);
  if (!stat.isFile()) continue;

  const ext = path.extname(file).toLowerCase();
  const content = fs.readFileSync(file, 'utf8');

  // 1. Merge conflict markers
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (CONFLICT_MARKER_REGEX.test(lines[i])) {
      console.error(`[STAGED CHECK FAILED] Merge conflict marker detected in ${file}:${i + 1}`);
      hasError = true;
      break;
    }
  }

  // 2. JSON syntax validation
  if (ext === '.json') {
    try {
      JSON.parse(content);
    } catch (err) {
      console.error(`[STAGED CHECK FAILED] Invalid JSON syntax in ${file}: ${err.message}`);
      hasError = true;
    }
  }

  // 3. JavaScript syntax verification via node --check
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
    const checkRes = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (checkRes.status !== 0) {
      console.error(`[STAGED CHECK FAILED] JS syntax error in ${file}:\n${checkRes.stderr || checkRes.stdout}`);
      hasError = true;
    }
  }
}

if (hasError) {
  console.error('\n[COMMIT REJECTED] Fix the staged file issues above before committing.\n');
  process.exit(1);
}

// 4. Deterministic Supply-Chain & Malware Signature Scan on staged files
const vetScript = path.join(__dirname, 'vet-repo.mjs');
if (fs.existsSync(vetScript)) {
  const vetRes = spawnSync(process.execPath, [vetScript, '--staged', ...files], { encoding: 'utf8' });
  if (vetRes.status !== 0) {
    if (vetRes.stderr) console.error(vetRes.stderr.trim());
    if (vetRes.stdout) console.error(vetRes.stdout.trim());
    console.error('\n[COMMIT REJECTED] Supply-chain security scan flagged staged file(s).\n');
    process.exit(1);
  }
}

process.exit(0);
