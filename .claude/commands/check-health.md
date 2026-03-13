# Check Health

Run a comprehensive health check on one or all packages in the xchainjs monorepo.

## Input

Package name or "all": $ARGUMENTS

## Instructions

1. **Determine scope.** From `$ARGUMENTS`:
   - If "all" or empty: check all packages
   - Otherwise, resolve the package name:
     - If it already starts with `xchain-`, use `packages/$ARGUMENTS`
     - Otherwise, try `packages/xchain-$ARGUMENTS`
     - If neither exists, glob for `packages/*$ARGUMENTS*` and ask the user to clarify

2. **For each package in scope, run these checks:**

### A. Structure Check
   - Verify expected files exist: `package.json`, `tsconfig.json`, `rollup.config.js`, `src/index.ts`
   - Check for `__tests__/` directory (warn if missing)
   - Verify `package.json` has required scripts: `build`, `test`, `lint`

### B. Build Check
   ```bash
   yarn build --filter=@xchainjs/xchain-<name>
   ```
   - Report: success/failure, cache hit, build time

### C. Lint Check
   ```bash
   cd packages/xchain-<name> && yarn lint
   ```
   - Report: clean or number of issues

### D. Test Check
   ```bash
   cd packages/xchain-<name> && yarn test
   ```
   - Report: total/passed/failed/skipped

### E. Dependency Check
   - Verify all `@xchainjs/*` deps use `workspace:*` protocol
   - Check for any deps that aren't in the monorepo
   - Warn about unused dependencies (listed in package.json but not imported)

3. **For "all" scope**, run checks efficiently:
   - Build all at once: `yarn build` (Turborepo handles parallelism and caching)
   - Then run lint and test per-package, or use `yarn lint` and `yarn test` at root
   - Summarize results in a table

4. **Generate a health report** in this format:

   ```
   Package Health Report: xchain-<name>
   =====================================
   Structure:    [PASS/WARN] — details
   Build:        [PASS/FAIL] — time, cache status
   Lint:         [PASS/FAIL] — N issues
   Tests:        [PASS/FAIL] — N passed, N failed, N skipped
   Dependencies: [PASS/WARN] — details

   Overall: HEALTHY / NEEDS ATTENTION / FAILING
   ```

5. **For "all" scope**, provide a summary table:
   ```
   Package              Build  Lint  Tests  Deps   Status
   xchain-bitcoin       PASS   PASS  PASS   PASS   HEALTHY
   xchain-ethereum      PASS   PASS  FAIL   PASS   NEEDS ATTENTION
   ...
   ```

6. **Highlight actionable items** — specific commands to fix any issues found.
