---
name: repo-vetting
description: Vet third-party GitHub repositories, npm packages, and agent skills for malware, hidden auto-run scripts, and supply-chain traps before cloning, installing, or copying code into the workspace. Trigger automatically whenever the user shares a GitHub link or asks to adopt external code or skills.
---

# Third-Party GitHub Repository & Skill Vetting

Never run `npm install`, open a downloaded repo in an editor, or copy external code/skills until the target passes deterministic vetting.

## Mandatory 4-Step Protocol

1. **Pre-Download Reputation & History Check (Before Cloning):**
   - Check the repository's star history (`https://star-history.com/#<owner>/<repo>`) for sudden vertical spikes followed by flatlines.
   - Check commit history for single-commit mass drops, brand-new throwaway accounts, or sudden mass deletions followed by obfuscated commits.
   - Inspect `package.json` (`preinstall`, `install`, `postinstall`) and `.vscode/tasks.json` (`runOn: "folderOpen"`) on GitHub *before* cloning or installing.

2. **Safe Inspection Without Execution:**
   - Never run `npm install`, `yarn`, `pnpm`, `pip install`, or shell scripts from an unvetted repository.
   - Never open an unvetted folder with Workspace Trust enabled before checking `.vscode/tasks.json` and `.vscode/settings.json`.

3. **Run the Deterministic Scanner (`scripts/vet-repo.mjs`):**
   - For any cloned/downloaded repository:
     ```bash
     npm run vet -- <path-to-repo> --repo <owner>/<repo> --strict
     ```
   - For any new agent skill placed under `.agents/skills/`:
     ```bash
     npm run vet:skills
     ```
   - Review every `HIGH` and `WARN` finding directly in source:
     - Embedded Windows PE / Base64 droppers, native memory loaders, hex shellcode
     - Remote script downloads piped directly into a shell interpreter or PowerShell web-client loaders
     - Obfuscated dynamic execution (`eval(atob(...))`, `Buffer.from(...)`)
     - Horizontally padded off-screen lines (>500 chars) or anomalous file size/line ratios (>100 KB in <1,000 lines)
     - Malicious `package.json` `preinstall`/`postinstall` hooks
     - `.vscode/tasks.json` auto-run on folder open (`runOn: "folderOpen"`)
     - Prompt-injection or secret-exfiltration instructions inside skill markdown files

4. **Plain-English Verdict Gate:**
   - **SAFE (Green):** Zero `HIGH` findings, clean git history, clean config hooks → safe to install or integrate.
   - **REVIEW NEEDED (Yellow):** Only `WARN` items (e.g., benign long lines or custom build hook) → explain each warning in plain terms and ask the user before proceeding.
   - **UNSAFE (Red):** Any `HIGH` finding → stop immediately, do **not** run or install anything, explain the exact threat in plain English, and recommend deleting the download.
