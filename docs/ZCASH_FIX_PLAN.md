# ZCash Package Fix Plan

## Status: COMPLETED

All critical issues have been fixed. See details below.

---

## Completed Work

### Phase 1: Fork Setup - DONE
Created `@xchainjs/zcash-js` package at `packages/zcash-js/` as a fork of `@mayaprotocol/zcash-js`.

### Phase 2: Fix Consensus Branch ID - DONE
**NU6.1 Branch ID:** `0x4DEC4DF0` (activated November 24, 2025 at block height 3,146,400)

Fixed in `packages/zcash-js/src/builder.ts`:
- Line ~20: Header constant `NU6_1_CONSENSUS_BRANCH_ID = 0x4dec4df0`
- Line ~113: Header hash calculation
- Line ~216: Signature hash personalization
- Line ~251: Final transaction serialization

Old (broken): `0xc8e71055` (NU5)
New (fixed): `0x4DEC4DF0` (NU6.1)

### Phase 3: Fix Browser Compatibility - DONE

1. **Replaced blake2b-wasm with @noble/hashes**
   - Pure JavaScript implementation
   - No WASM loading issues
   - Works in all browsers

2. **Buffer usage unchanged**
   - Uses `buffer` npm package (already browser-compatible)
   - No Node.js-specific APIs

3. **ESM exports configured correctly**
   - Dual CJS/ESM output via Rollup
   - Proper package.json exports

### Phase 5: Update xchain-zcash - DONE

Updated `packages/xchain-zcash/`:
- `package.json`: Changed dependency from `@mayaprotocol/zcash-js` to `@xchainjs/zcash-js: workspace:*`
- `src/client.ts`: Updated import
- `src/clientKeystore.ts`: Updated import
- `src/utils.ts`: Updated import

### Phase 6: Integration Testing - DONE

- ZCash enabled in testing-gui
- Dev server starts without errors
- All chain clients load correctly

---

## Files Modified/Created

### New Package: `packages/zcash-js/`
```
packages/zcash-js/
├── package.json
├── rollup.config.js
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── types.ts
    ├── addr.ts
    ├── builder.ts    # Contains NU6.1 fix
    ├── script.ts
    ├── writer.ts
    └── rpc.ts
```

### Updated: `packages/xchain-zcash/`
- `package.json` - Dependency update
- `src/client.ts` - Import update
- `src/clientKeystore.ts` - Import update
- `src/utils.ts` - Import update

### Updated: `tools/testing-gui/`
- `package.json` - Added @xchainjs/xchain-zcash dependency
- `src/lib/clients/factory.ts` - Enabled ZCash
- `src/lib/chains/index.ts` - Added ZEC config
- `src/components/layout/Sidebar.tsx` - Added ZEC to sidebar

---

## Technical Details

### NU6.1 Consensus Branch ID
- **Value:** `0x4DEC4DF0`
- **Source:** ZIP 255 (https://zips.z.cash/zip-0255)
- **Activation:** Block 3,146,400 (November 24, 2025)

### Browser Compatibility Solution
Used `@noble/hashes` instead of `blake2b-wasm`:
```typescript
import { blake2b } from '@noble/hashes/blake2b'

function blake2bWithPersonal(data: Uint8Array, personal: string | Uint8Array): Uint8Array {
  const personalBytes = typeof personal === 'string' ? new TextEncoder().encode(personal) : personal
  const paddedPersonal = new Uint8Array(16)
  paddedPersonal.set(personalBytes.slice(0, 16))
  return blake2b(data, { dkLen: 32, personalization: paddedPersonal })
}
```

---

## Remaining Work (Optional)

### Phase 4: Improve Error Handling
**Priority:** Low
**Status:** Not started

The broadcast error handling could be improved to show actual node responses instead of generic messages. This is a quality-of-life improvement, not a blocker.

---

## Verification

To verify the fix works:

1. Build packages:
   ```bash
   yarn build --filter=@xchainjs/zcash-js --filter=@xchainjs/xchain-zcash
   ```

2. Start testing-gui:
   ```bash
   cd tools/testing-gui && yarn dev
   ```

3. Navigate to ZCash chain and test operations

---

## References

- Issue #1592: https://github.com/xchainjs/xchainjs-lib/issues/1592
- GitLab Issue: https://gitlab.com/mayachain/chains/zcash/-/issues/4
- ZIP 255: https://zips.z.cash/zip-0255
- NU6.1 Info: https://z.cash/upgrade/nu6-1/
