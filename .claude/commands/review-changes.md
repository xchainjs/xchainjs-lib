# Review Changes

Perform a pre-commit review of all staged and unstaged changes for correctness, style, tests, and changesets.

## Input

Optional focus area or additional context: $ARGUMENTS

## Instructions

1. **Gather the changes.** Run:
   - `git status` to see all modified, added, and deleted files
   - `git diff` to see unstaged changes
   - `git diff --cached` to see staged changes
   - If no changes exist, inform the user and stop

2. **Identify affected packages.** From changed file paths, determine which `packages/xchain-*` packages are modified. Also note changes to root config files.

3. **Review each changed file** for:

### A. Correctness
   - Logic errors, off-by-one errors, null/undefined handling
   - Incorrect use of xchainjs patterns (wrong base class, missing method override)
   - Breaking changes to public API (exported types, function signatures)
   - Security issues: hardcoded keys, exposed secrets, injection vulnerabilities

### B. Code Style
   - Matches repo conventions: single quotes, no semicolons, trailing commas, 120 char width
   - Consistent with surrounding code in the same file
   - No unnecessary changes (whitespace-only diffs, reformatting unrelated code)
   - Imports organized properly

### C. Type Safety
   - Proper TypeScript types (no unnecessary `any`, proper generics)
   - Consistent with types from `xchain-util` (`Asset`, `BaseAmount`, `Address`, etc.)
   - No type assertions (`as`) that could hide bugs

### D. Tests
   - If source code changed, are tests updated/added?
   - Do existing tests still cover the changed behavior?
   - Check for test files in `__tests__/` of affected packages

### E. Changeset
   - If package source code changed, a changeset should exist
   - Check `.changeset/` directory for new changeset files
   - If missing, remind the user to run `yarn update-packages`
   - Verify bump type is appropriate (patch for fixes, minor for features, major for breaking)

4. **Check cross-package impact.** If a shared package changed (xchain-client, xchain-util, xchain-utxo, xchain-evm, xchain-cosmos-sdk):
   - List all downstream packages that could be affected
   - Suggest running their tests too

5. **Generate the review report:**

   ```
   Pre-Commit Review
   =================

   Packages affected: xchain-bitcoin, xchain-utxo
   Files changed: N modified, N added, N deleted

   Issues Found:
   - [CRITICAL] description (file:line)
   - [WARNING] description (file:line)
   - [SUGGESTION] description (file:line)

   Changeset: [PRESENT/MISSING] — bump type appropriate: [YES/NO]
   Tests: [UPDATED/NEEDED/N/A]

   Verdict: READY TO COMMIT / NEEDS CHANGES
   ```

6. **If issues are found**, offer to fix them automatically where possible (lint issues, missing imports, simple type fixes).
