#!/usr/bin/env node
/**
 * Deterministic Supply-Chain & Third-Party Repository Vetting Scanner
 *
 * Non-AI static analyzer to vet third-party repositories/skills before adopting
 * them, and to guard this repository in `npm run verify` & CI.
 *
 * Usage:
 *   node scripts/vet-repo.mjs [targetDir] [--repo owner/repo] [--strict] [--staged file1 ...]
 *   npm run vet:self
 *   npm run vet:skills
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const SOURCE_EXTENSIONS = new Set([
  '.py', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx',
  '.sh', '.bash', '.zsh', '.ps1', '.go', '.rb', '.php', '.rs', '.java',
]);

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.next', '.turbo', '.vercel',
  'dist', 'build', 'out', 'coverage', '.cache', 'generated',
  '__pycache__', '.venv', 'venv', 'public', 'resources',
]);

const MAX_BYTES_FOR_SHORT_FILE = 100 * 1024; // 100 KB
const SHORT_FILE_LINE_THRESHOLD = 1000;      // < 1,000 lines
const MAX_LINE_LENGTH = 500;                 // 500 chars horizontal-hiding threshold

const MALWARE_SIGNATURES = [
  {
    id: 'PE_DROPPER_MARKER',
    severity: 'HIGH',
    label: 'Embedded Windows PE / MZ Base64 dropper marker',
    regex: /\b(?:PE_B64|encoded_pe|PE_PAYLOAD)\b|TVqQAAMAAAAEAAAA|TVpQAAIAAAAEAA8A/,
  },
  {
    id: 'IN_MEMORY_LOADER',
    severity: 'HIGH',
    label: 'In-memory native loader (ctypes / VirtualAlloc / RtlMoveMemory)',
    regex: /\b(?:ctypes\.windll|ctypes\.wintypes|VirtualAlloc|RtlMoveMemory|CreateRemoteThread|WriteProcessMemory|NtAllocateVirtualMemory)\b/,
  },
  {
    id: 'PIPE_TO_SHELL',
    severity: 'HIGH',
    label: 'Remote script piped directly to shell (curl/wget | sh/bash or PowerShell IEX)',
    regex: /(?:curl|wget)\s+[^\n|]{4,}\|\s*(?:sudo\s+)?(?:ba)?sh\b|Invoke-Expression\s*\(\s*\(?New-Object\s+Net\.WebClient|\biex\s*\(\s*\(New-Object\s+Net\.WebClient/i,
  },
  {
    id: 'OBFUSCATED_DYNAMIC_EXEC',
    severity: 'HIGH',
    label: 'Obfuscated dynamic code execution (eval/exec/Function on decoded payload)',
    regex: /\b(?:eval|exec)\s*\(\s*(?:atob|Buffer\.from|base64\.b64decode|zlib\.decompress|codecs\.decode)\s*\(|\bnew\s+Function\s*\(\s*(?:atob|Buffer\.from)\s*\(|\bsubprocess\.(?:Popen|run|call)\s*\([^)]*base64/i,
  },
  {
    id: 'WINDOWS_PERSISTENCE_RUNKEY',
    severity: 'HIGH',
    label: 'Windows Run-key or scheduled-task persistence indicator',
    regex: /Software\\+Microsoft\\+Windows\\+CurrentVersion\\+Run(?:Once)?\b|HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run|\bschtasks\s+\/create\b/i,
  },
  {
    id: 'LONG_HEX_SHELLCODE',
    severity: 'HIGH',
    label: 'Long raw hex escape sequence (possible embedded shellcode)',
    regex: /(?:\\x[0-9a-fA-F]{2}){40,}/,
  },
  {
    id: 'LONG_BASE64_BLOB',
    severity: 'WARN',
    label: 'Long uninterrupted Base64 blob (>= 240 chars outside image/font data URI)',
    regex: /(?<![A-Za-z0-9+/=])[A-Za-z0-9+/]{240,}={0,2}(?![A-Za-z0-9+/=])/,
    skipLineIf: (line) =>
      /data:(?:image|font|audio|video)\//i.test(line) ||
      /integrity=["']sha(?:256|384|512)-/i.test(line),
  },
];

function isSvgOrDataAssetLine(line) {
  const trimmed = line.trim();
  if (/data:(?:image|font)\//i.test(trimmed)) return true;
  if (/<path\b[^>]*\bd=["'][^"']{200,}["']/i.test(trimmed)) return true;
  if (/^\s*d=["'][MmLlHhVvCcSsQqTtAaZz0-9.,\s-]{200,}["']/.test(trimmed)) return true;
  return false;
}

export function scanFileContent(filePath, content, options = {}) {
  const { strictLineLength = false } = options;
  const findings = [];
  const normalizedPath = filePath.replace(/\\/g, '/');

  if (
    normalizedPath.endsWith('scripts/vet-repo.mjs') ||
    normalizedPath.endsWith('__tests__/security-hardening.test.ts')
  ) {
    return findings;
  }

  const byteSize = Buffer.byteLength(content, 'utf8');
  const lines = content.split(/\r?\n/);
  const lineCount = lines.length;

  if (byteSize > MAX_BYTES_FOR_SHORT_FILE && lineCount < SHORT_FILE_LINE_THRESHOLD) {
    findings.push({
      file: normalizedPath,
      line: 1,
      id: 'SIZE_LINE_RATIO_ANOMALY',
      severity: 'HIGH',
      message: `Anomalous byte-to-line ratio: ${(byteSize / 1024).toFixed(1)} KB across only ${lineCount} lines.`,
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = i + 1;

    if (line.length > MAX_LINE_LENGTH) {
      const hasSuspiciousLeadingWhitespace = /^\s{120,}\S/.test(line);
      if (hasSuspiciousLeadingWhitespace) {
        findings.push({
          file: normalizedPath,
          line: lineNo,
          id: 'HORIZONTAL_OFFSCREEN_PADDING',
          severity: 'HIGH',
          message: `Line exceeds ${MAX_LINE_LENGTH} chars (${line.length} chars) with heavy leading whitespace padding.`,
        });
      } else if (!isSvgOrDataAssetLine(line)) {
        findings.push({
          file: normalizedPath,
          line: lineNo,
          id: 'LONG_LINE_ANOMALY',
          severity: strictLineLength ? 'HIGH' : 'WARN',
          message: `Line length ${line.length} chars exceeds ${MAX_LINE_LENGTH}-char threshold.`,
        });
      }
    }

    for (const sig of MALWARE_SIGNATURES) {
      if (sig.skipLineIf && sig.skipLineIf(line)) continue;
      if (sig.regex.test(line)) {
        findings.push({
          file: normalizedPath,
          line: lineNo,
          id: sig.id,
          severity: sig.severity,
          message: sig.label,
        });
      }
    }
  }

  return findings;
}

function collectSourceFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(full, out);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!SOURCE_EXTENSIONS.has(ext)) continue;
      if (/\.min\.(?:js|mjs|cjs)$/i.test(entry.name)) continue;
      out.push(full);
    }
  }
  return out;
}

function detectGithubSlug(targetDir, explicitRepo) {
  if (explicitRepo) {
    return explicitRepo.replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '');
  }
  const res = spawnSync('git', ['-C', targetDir, 'remote', 'get-url', 'origin'], { encoding: 'utf8' });
  if (res.status !== 0 || !res.stdout) return null;
  const url = res.stdout.trim();
  const match = url.match(/github\.com[:/]([^/\s]+\/[^/\s]+?)(?:\.git)?$/i);
  return match ? match[1] : null;
}

function checkGitHistoryAnomalies(targetDir) {
  const warnings = [];
  const isGit = spawnSync('git', ['-C', targetDir, 'rev-parse', '--is-inside-work-tree'], { encoding: 'utf8' });
  if (isGit.status !== 0) return { isGit: false, warnings };

  const countRes = spawnSync('git', ['-C', targetDir, 'rev-list', '--count', 'HEAD'], { encoding: 'utf8' });
  const totalCommits = parseInt((countRes.stdout || '').trim(), 10) || 0;

  const recentRes = spawnSync(
    'git',
    ['-C', targetDir, 'log', '-n', '15', '--shortstat', '--pretty=format:__COMMIT__%h|%ad|%s', '--date=short'],
    { encoding: 'utf8' }
  );

  if (recentRes.status === 0 && recentRes.stdout) {
    const blocks = recentRes.stdout.split('__COMMIT__').filter(Boolean);
    for (const block of blocks) {
      const [header, statLine = ''] = block.trim().split(/\r?\n/);
      const filesMatch = statLine.match(/(\d+)\s+files?\s+changed/);
      const delMatch = statLine.match(/(\d+)\s+deletions?\(-\)/);
      const filesChanged = filesMatch ? parseInt(filesMatch[1], 10) : 0;
      const deletions = delMatch ? parseInt(delMatch[1], 10) : 0;

      if (totalCommits <= 3 && filesChanged >= 80) {
        warnings.push(`Sudden single-commit drop risk: commit (${header}) changed ${filesChanged} files.`);
      }
      if (deletions >= 5000 && filesChanged >= 25) {
        warnings.push(`Large tracked-file deletion event in commit (${header}): ${filesChanged} files, ${deletions} deletions.`);
      }
    }
  }

  return { isGit: true, totalCommits, warnings };
}

const SKILL_MD_THREAT_RULES = [
  {
    id: 'SKILL_PIPE_TO_SHELL',
    severity: 'HIGH',
    pattern: /\b(?:curl|wget)\b[^\n|]{0,180}\|\s*(?:ba)?sh\b/i,
    message: 'Remote download piped directly to shell inside skill markdown',
  },
  {
    id: 'SKILL_ENCODED_SHELL',
    severity: 'HIGH',
    pattern: /\bpowershell(?:\.exe)?\b[^\n]{0,80}-e(?:nc(?:odedcommand)?)?\s+[A-Za-z0-9+/=]{24,}|\bbase64\s+(?:-d|--decode)\s*\|\s*(?:ba)?sh\b/i,
    message: 'Encoded shell execution payload inside skill markdown',
  },
  {
    id: 'SKILL_PROMPT_INJECTION_EXFIL',
    severity: 'HIGH',
    pattern: /(?:ignore\s+(?:all\s+)?previous\s+instructions|disregard\s+system\s+prompt)[\s\S]{0,160}(?:\.env|secret|token|exfiltrate|curl|upload)|(?:exfiltrate|send|post)\b[^\n]{0,80}(?:\.env\.local|SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY|META_WA_ACCESS_TOKEN|UPSTASH_REDIS_REST_TOKEN|webhook\.site|ngrok\.io)/i,
    message: 'Prompt-injection or secret exfiltration instruction inside skill markdown',
  },
];

export function scanSkillMarkdown(relPath, content) {
  const findings = [];
  const lines = content.split(/\r?\n/);
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    for (const rule of SKILL_MD_THREAT_RULES) {
      if (rule.pattern.test(line)) {
        findings.push({
          severity: rule.severity,
          id: rule.id,
          file: relPath,
          line: idx + 1,
          message: rule.message,
        });
      }
    }
  }
  return findings;
}

export function vetSkillsDirectory(skillsRoot) {
  const findings = [];
  const skills = [];
  if (!fs.existsSync(skillsRoot)) {
    return { skills, findings };
  }

  const dirs = fs.readdirSync(skillsRoot, { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const d of dirs) {
    const skillDir = path.join(skillsRoot, d.name);
    const skillMdPath = path.join(skillDir, 'SKILL.md');
    let validFrontmatter = false;
    if (!fs.existsSync(skillMdPath)) {
      findings.push({
        severity: 'WARN',
        id: 'SKILL_MISSING_MANIFEST',
        file: path.join(d.name, 'SKILL.md'),
        line: 1,
        message: 'Skill folder is missing SKILL.md manifest',
      });
    } else {
      const md = fs.readFileSync(skillMdPath, 'utf8');
      validFrontmatter = /^---\r?\n[\s\S]*?\bname:\s*\S+[\s\S]*?\bdescription:\s*\S+[\s\S]*?\r?\n---/.test(md);
      if (!validFrontmatter) {
        findings.push({
          severity: 'WARN',
          id: 'SKILL_INVALID_FRONTMATTER',
          file: path.join(d.name, 'SKILL.md'),
          line: 1,
          message: 'SKILL.md is missing valid YAML frontmatter (name + description)',
        });
      }
    }

    const codeFiles = collectSourceFiles(skillDir);
    for (const cf of codeFiles) {
      const rel = path.relative(skillsRoot, cf);
      try {
        findings.push(...scanFileContent(rel, fs.readFileSync(cf, 'utf8')));
      } catch {
        // skip binary
      }
    }

    const walkMd = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SKIP_DIRS.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkMd(full);
        else if (entry.isFile() && /\.md$/i.test(entry.name)) {
          const rel = path.relative(skillsRoot, full);
          try {
            findings.push(...scanSkillMarkdown(rel, fs.readFileSync(full, 'utf8')));
          } catch {
            // skip unreadable
          }
        }
      }
    };
    walkMd(skillDir);

    skills.push({ name: d.name, codeFiles: codeFiles.length, validFrontmatter });
  }

  return { skills, findings };
}

function runCli() {
  const argv = process.argv.slice(2);
  let targetDir = process.cwd();
  let explicitRepo = null;
  let strictLineLength = false;
  let selfMode = false;
  let skillsMode = false;
  let stagedFiles = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--strict') strictLineLength = true;
    else if (arg === '--self') selfMode = true;
    else if (arg === '--skills') skillsMode = true;
    else if (arg === '--repo' && argv[i + 1]) explicitRepo = argv[++i];
    else if (arg === '--staged') {
      stagedFiles = argv.slice(i + 1);
      break;
    } else if (!arg.startsWith('-')) {
      targetDir = path.resolve(arg);
    }
  }

  if (skillsMode) {
    const skillsRoot = targetDir === process.cwd() ? path.join(process.cwd(), '.agents', 'skills') : targetDir;
    const { skills, findings } = vetSkillsDirectory(skillsRoot);
    const high = findings.filter((f) => f.severity === 'HIGH');
    const warn = findings.filter((f) => f.severity === 'WARN');
    console.log('================================================================');
    console.log(' AGENT SKILLS SUPPLY-CHAIN & PROMPT-INJECTION VET REPORT');
    console.log('================================================================');
    console.log(`Skills folder:  ${skillsRoot}`);
    console.log(`Skills checked: ${skills.length}`);
    console.log(`High findings:  ${high.length} | Warnings: ${warn.length}`);
    for (const s of skills) {
      console.log(`  - ${s.name.padEnd(38)} [frontmatter: ${s.validFrontmatter ? 'OK' : 'WARN'}, code files: ${s.codeFiles}]`);
    }
    if (high.length > 0) {
      console.log('\n[HIGH SEVERITY FINDINGS]');
      for (const f of high) console.log(`  - ${f.file}:${f.line} [${f.id}] ${f.message}`);
    }
    console.log('================================================================');
    process.exit(high.length > 0 ? 1 : 0);
  }

  const filesToScan = stagedFiles
    ? stagedFiles
        .map((f) => path.resolve(f))
        .filter((f) => fs.existsSync(f) && fs.statSync(f).isFile() && SOURCE_EXTENSIONS.has(path.extname(f).toLowerCase()))
    : collectSourceFiles(targetDir);

  const allFindings = [];
  for (const file of filesToScan) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const rel = path.relative(targetDir, file) || file;
      allFindings.push(...scanFileContent(rel, content, { strictLineLength }));
    } catch {
      // skip binary
    }
  }

  const highFindings = allFindings.filter((f) => f.severity === 'HIGH');
  const warnFindings = allFindings.filter((f) => f.severity === 'WARN');

  if (stagedFiles) {
    if (highFindings.length > 0) {
      for (const f of highFindings) {
        console.error(`[SUPPLY-CHAIN VET FAIL] ${f.file}:${f.line} [${f.id}] ${f.message}`);
      }
      process.exit(1);
    }
    process.exit(0);
  }

  console.log('================================================================');
  console.log(' DETERMINISTIC SUPPLY-CHAIN & REPO VETTING REPORT');
  console.log('================================================================');
  console.log(`Target:        ${targetDir}`);
  console.log(`Files scanned: ${filesToScan.length}`);
  console.log(`High findings: ${highFindings.length} | Warnings: ${warnFindings.length}`);

  if (highFindings.length > 0) {
    console.log('\n[HIGH SEVERITY FINDINGS]');
    for (const f of highFindings.slice(0, 30)) {
      console.log(`  - ${f.file}:${f.line} [${f.id}] ${f.message}`);
    }
  }

  if (warnFindings.length > 0 && !selfMode) {
    console.log('\n[WARNINGS FOR MANUAL REVIEW]');
    for (const f of warnFindings.slice(0, 20)) {
      console.log(`  - ${f.file}:${f.line} [${f.id}] ${f.message}`);
    }
  }

  const slug = detectGithubSlug(targetDir, explicitRepo);
  const gitReport = checkGitHistoryAnomalies(targetDir);
  console.log('\n[REPO LEGITIMACY CHECKLIST]');
  if (slug) console.log(`  - Star History: https://star-history.com/#${slug}`);
  if (gitReport.isGit) {
    console.log(`  - Git History: ${gitReport.totalCommits} commits checked.`);
    for (const w of gitReport.warnings) console.log(`    [WARN] ${w}`);
  }
  console.log('================================================================');

  process.exit(highFindings.length > 0 ? 1 : 0);
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'));

if (isDirectExecution) {
  runCli();
}
