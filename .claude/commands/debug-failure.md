# Debug Failure

Trace and diagnose build, test, or lint failures through the xchainjs dependency graph.

## Input

Error context (error message, package name, or description): $ARGUMENTS

## Instructions

1. **Categorize the failure.** From `$ARGUMENTS`, determine:
   - **Build failure**: TypeScript compilation errors, missing modules, rollup errors
   - **Test failure**: Jest assertion errors, timeout errors, module resolution errors in tests
   - **Lint failure**: ESLint or Prettier violations
   - **Runtime error**: Errors from e2e tests or actual execution
   - **Dependency issue**: Version mismatches, missing workspace deps

2. **Identify the failing package.** Extract the package name from:
   - Error paths (e.g., `packages/xchain-bitcoin/src/client.ts`)
   - Module names (e.g., `@xchainjs/xchain-client`)
   - If unclear, ask the user which package is affected

3. **Reproduce the failure.** Run the appropriate command:
   - Build: `yarn build --filter=@xchainjs/xchain-<name>`
   - Test: `cd packages/xchain-<name> && yarn test`
   - Lint: `cd packages/xchain-<name> && yarn lint`

4. **Trace through the dependency graph.** Read `package.json` of the failing package and its upstream deps:
   - If the error is "cannot find module @xchainjs/xchain-foo", check if `xchain-foo` builds successfully
   - If the error is a type mismatch, check if an upstream package changed its exported types
   - Walk up the dependency chain until you find the root cause

5. **Check common failure patterns:**
   - **Stale Turborepo cache**: After branch switches or upstream changes, cached builds may be stale. Try `rm -rf .turbo && yarn build`
   - **Missing build**: Tests depend on `^build` — upstream packages must be built first
   - **Circular dependency**: Check if a new import creates a cycle
   - **Version mismatch**: Check that all `workspace:*` deps resolve correctly
   - **Node version**: Repo requires Node 20.14 (check `.nvmrc`). Run `nvm use`
   - **Yarn install needed**: After pulling changes, `yarn install` may be needed for new deps

6. **Read the source code** at the error location. Understand the context and suggest a fix.

7. **Report findings** with:
   - Root cause identified
   - Which package(s) are affected
   - Dependency chain involved (if cross-package)
   - Suggested fix with specific file and line references
   - Commands to verify the fix
