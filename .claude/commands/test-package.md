# Test Package

Run tests and debug test failures for a package in the xchainjs monorepo.

## Input

Package identifier (and optional test file path or pattern): $ARGUMENTS

## Instructions

1. **Parse the input.** The user may provide:
   - Just a package name: `bitcoin` or `xchain-bitcoin`
   - A package name + test file: `bitcoin client.test.ts`
   - A package name + pattern: `bitcoin --grep "transfer"`

   Split `$ARGUMENTS` into the package name (first word) and optional test specifier (rest).

2. **Resolve the package name.** The user may provide a short name like "bitcoin" or "thorchain-amm". Resolve it:
   - If it already starts with `xchain-`, use `packages/$ARGUMENTS`
   - Otherwise, try `packages/xchain-$ARGUMENTS`
   - If neither exists, glob for `packages/*$ARGUMENTS*` and ask the user to clarify if ambiguous

3. **Ensure dependencies are built.** Tests depend on upstream `^build`. Run:
   ```bash
   yarn build --filter=@xchainjs/xchain-<name>
   ```

4. **Run tests.**
   - **All tests in package:**
     ```bash
     cd packages/xchain-<name> && yarn test
     ```
   - **Single test file:**
     ```bash
     cd packages/xchain-<name> && npx jest __tests__/<file>
     ```
   - **E2E tests** (if `__e2e__/` directory exists):
     ```bash
     cd packages/xchain-<name> && yarn e2e
     ```

5. **If tests fail**, diagnose:
   - Read the failing test file and the source code it tests
   - Check if the failure is a **build issue** (module not found, cannot resolve) — if so, suggest building first
   - Check if the failure is a **mock issue** (outdated mocks, missing fixtures in `__tests__/` or `__mocks__/`)
   - Check if the failure is a **type mismatch** from a changed upstream package
   - For timeout failures in e2e: these often need network access or environment variables (API keys, RPC endpoints)

6. **Report results.** Summarize:
   - Total tests, passed, failed, skipped
   - For failures: file, test name, assertion that failed, and suggested fix
