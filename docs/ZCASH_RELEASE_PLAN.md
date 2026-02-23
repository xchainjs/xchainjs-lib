# ZCash Package Release Plan

## Overview

This document outlines the steps to release the new `@xchainjs/zcash-js` package and update `@xchainjs/xchain-zcash` to use it.

---

## Pre-Release Checklist

### 1. Verify Package Configuration

- [x] `packages/zcash-js/package.json` has correct metadata
- [x] `packages/zcash-js/README.md` exists with documentation
- [x] `packages/zcash-js/tsconfig.json` extends root config
- [x] `packages/zcash-js/rollup.config.js` configured correctly
- [ ] Add `LICENSE` file to `packages/zcash-js/`

### 2. Verify Build

```bash
# Build the new package and its dependents
yarn build --filter=@xchainjs/zcash-js --filter=@xchainjs/xchain-zcash --filter=@xchainjs/xchain-mayachain-amm
```

### 3. Run Tests

```bash
# Run xchain-zcash tests
yarn test --filter=@xchainjs/xchain-zcash
```

---

## Release Steps

### Step 1: Add LICENSE File

Copy the MIT license from another package:
```bash
cp packages/xchain-bitcoin/LICENSE packages/zcash-js/
```

### Step 2: Create Changeset

```bash
yarn changeset
```

Select:
- `@xchainjs/zcash-js` - **minor** (new package, first release as 1.0.0)
- `@xchainjs/xchain-zcash` - **minor** (dependency change + NU6.1 support)

Changeset message:
```
Add @xchainjs/zcash-js package with NU6.1 consensus branch ID support

- Fork of @mayaprotocol/zcash-js with critical fixes
- Updated consensus branch ID from 0xc8e71055 (NU5) to 0x4DEC4DF0 (NU6.1)
- Replaced blake2b-wasm with @noble/hashes for browser compatibility
- Pure JavaScript implementation, no WASM required
```

### Step 3: Commit Changes

```bash
git add .
git commit -m "feat(zcash): add zcash-js package with NU6.1 support

- Create @xchainjs/zcash-js as fork of @mayaprotocol/zcash-js
- Update consensus branch ID to NU6.1 (0x4DEC4DF0)
- Replace blake2b-wasm with @noble/hashes for browser compatibility
- Update @xchainjs/xchain-zcash to use new package

Fixes #1592

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Step 4: Create Pull Request

```bash
git push -u origin feat/zcash-nu6.1-fix

gh pr create --title "feat(zcash): Add zcash-js with NU6.1 support" --body "$(cat <<'EOF'
## Summary

- Created `@xchainjs/zcash-js` package as a fork of `@mayaprotocol/zcash-js`
- Updated consensus branch ID from NU5 (`0xc8e71055`) to NU6.1 (`0x4DEC4DF0`)
- Replaced `blake2b-wasm` with `@noble/hashes` for browser compatibility
- Updated `@xchainjs/xchain-zcash` to use the new package

## Changes

### New Package: `@xchainjs/zcash-js`
- Pure JavaScript ZCash transaction builder
- NU6.1 consensus branch ID support
- Browser-compatible (no WASM)

### Updated: `@xchainjs/xchain-zcash`
- Changed dependency from `@mayaprotocol/zcash-js` to `@xchainjs/zcash-js`

## Test Plan

- [x] Package builds successfully
- [x] xchain-zcash builds successfully
- [x] testing-gui dev server starts with ZCash enabled
- [ ] Manual test: ZCash address generation
- [ ] Manual test: ZCash balance query
- [ ] Manual test: ZCash transaction broadcast (testnet)

## Fixes

Closes #1592

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Step 5: After PR Merge - Publish

Once merged to master:

```bash
# Version packages (uses changesets)
yarn increase-packages

# Build release versions
yarn build:release

# Publish to npm
yarn changeset publish
```

---

## Package Versioning

| Package | Current | New |
|---------|---------|-----|
| `@xchainjs/zcash-js` | N/A (new) | 1.0.0 |
| `@xchainjs/xchain-zcash` | 1.0.10 | 1.1.0 |

---

## Files to Include in Commit

### New Files
```
packages/zcash-js/
├── package.json
├── rollup.config.js
├── tsconfig.json
├── README.md
├── LICENSE
└── src/
    ├── index.ts
    ├── types.ts
    ├── addr.ts
    ├── builder.ts
    ├── script.ts
    ├── writer.ts
    └── rpc.ts
```

### Modified Files
```
packages/xchain-zcash/package.json
packages/xchain-zcash/src/client.ts
packages/xchain-zcash/src/clientKeystore.ts
packages/xchain-zcash/src/utils.ts
tools/testing-gui/package.json
tools/testing-gui/src/lib/clients/factory.ts
tools/testing-gui/src/lib/chains/index.ts
tools/testing-gui/src/components/layout/Sidebar.tsx
docs/ZCASH_FIX_PLAN.md
```

---

## Post-Release Verification

1. Verify packages published to npm:
   - https://www.npmjs.com/package/@xchainjs/zcash-js
   - https://www.npmjs.com/package/@xchainjs/xchain-zcash

2. Test in fresh project:
   ```bash
   npm install @xchainjs/xchain-zcash@latest
   ```

3. Close GitHub issue #1592

4. Update GitLab issue: https://gitlab.com/mayachain/chains/zcash/-/issues/4
