# Build Package

Build and diagnose build issues for a package in the xchainjs monorepo.

## Input

Package identifier: $ARGUMENTS

## Instructions

1. **Resolve the package name.** The user may provide a short name like "bitcoin" or "thorchain-amm". Resolve it:
   - If it already starts with `xchain-`, use `packages/$ARGUMENTS`
   - Otherwise, try `packages/xchain-$ARGUMENTS`
   - If neither exists, glob for `packages/*$ARGUMENTS*` and ask the user to clarify if ambiguous

2. **Verify the package exists.** Read `packages/xchain-<name>/package.json` to confirm the package name and check its dependencies.

3. **Build the package with Turborepo.** Run:
   ```bash
   yarn build --filter=@xchainjs/xchain-<name>
   ```
   This builds the package AND all its upstream dependencies (due to `^build` in turbo pipeline).

4. **If the build succeeds**, report:
   - Packages built (from Turborepo output)
   - Cache hits vs fresh builds
   - Output location: `packages/xchain-<name>/lib/`

5. **If the build fails**, diagnose:
   - Read the error output carefully
   - Check if it's a **dependency build failure** (upstream package failed) vs **this package's failure**
   - For TypeScript errors: read the failing source file and suggest fixes
   - For missing dependency errors: check if `yarn install` needs to run or if a `workspace:*` dep is missing from `package.json`
   - Common issue: Turborepo cache stale after branch switch — suggest `yarn build` (full rebuild) or clearing `.turbo/` cache

6. **Show the dependency chain.** List the package's internal `@xchainjs/*` dependencies from its `package.json` so the user understands what gets built.
