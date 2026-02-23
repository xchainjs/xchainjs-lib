# XChainJS Package Issues

This document contains issues discovered while building the testing-gui. These should be fixed to improve the library.

---

## 1. Wallet.getAddress() API Mismatch (CRITICAL)

**Location:** `packages/xchain-mayachain-amm/__e2e__/trade.e2e.ts` (lines 42, 65, 81, 107, 129, 147)

**Issue:** E2E tests call `wallet.getAddress(chain, index)` with 2 parameters, but the Wallet class method only accepts `chain`:

```typescript
// Current (wrong):
const address = await wallet.getAddress(MAYAChain, walletIndex)

// Should be:
const address = await wallet.getAddress(MAYAChain)
```

**Impact:** E2E tests fail at compile time. This indicates either:
- Tests are outdated and need updating, OR
- The Wallet API changed and tests weren't updated

**Fix:** Update all calls to `wallet.getAddress()` to use single parameter, or add wallet index support to the Wallet class if that was intended.

---

## 2. MayachainQuery Constructor Confusion (MAJOR)

**Location:** `packages/xchain-mayachain-query/__e2e__/trade.e2e.ts` (line 10)

**Issue:** Test attempts invalid instantiation:

```typescript
// Current (wrong):
new MayachainQuery({ network: Network.Stagenet })

// Correct pattern:
import { MidgardQuery } from '@xchainjs/xchain-mayamidgard-query'
import { MayachainQuery, MayachainCache, Mayanode } from '@xchainjs/xchain-mayachain-query'

const midgardQuery = new MidgardQuery()  // Uses default network
const mayanode = new Mayanode(network)
const cache = new MayachainCache(midgardQuery, mayanode)
const query = new MayachainQuery(cache)
```

**Impact:** Confusing API - users don't know how to properly instantiate MayachainQuery.

**Fix Options:**
1. Add clear JSDoc documentation to MayachainCache and MayachainQuery constructors
2. Add convenience factory method: `MayachainQuery.create(network)`
3. Update e2e tests to show correct usage pattern

---

## 3. MAYANameDetails Wrong Property Names (MAJOR)

**Location:** `packages/xchain-mayachain-query/__e2e__/mayachain-estimateSwap.e2e.ts` (lines 111-112)

**Issue:** Test accesses non-existent properties:

```typescript
// Current (wrong):
expire: mayaName.expire,
entries: mayaName.entries.map(...)

// Correct (based on actual type):
expireBlockHeight: mayaName.expireBlockHeight,
aliases: mayaName.aliases.map(...)
```

**Actual type definition:**
```typescript
export type MAYANameDetails = {
  name: string
  expireBlockHeight: number  // NOT 'expire'
  owner: string
  aliases: MAYANameAlias[]   // NOT 'entries'
}
```

**Impact:** Runtime errors when accessing undefined properties.

**Fix:** Update the e2e test to use correct property names.

---

## 4. Missing AssetBNB Import (MAJOR)

**Location:** `packages/xchain-thorchain-amm/__e2e__/thorchain-savers-e2e.ts` (line 59)

**Issue:** `AssetBNB` is used without being imported.

**Fix:** Add import:
```typescript
import { AssetBNB } from '@xchainjs/xchain-binance'
// OR
import { AssetBNB } from '@xchainjs/xchain-thorchain-query'
```

---

## 5. AnyAsset vs CompatibleAsset Type Mismatch (MODERATE)

**Location:** `packages/xchain-mayachain-amm/__tests__/trade.test.ts` (lines 193-217)

**Issue:** `assetFromStringEx()` returns `AnyAsset` but AMM methods expect `CompatibleAsset`:

```typescript
// Problem:
fromAsset: assetFromStringEx('ETH~ETH')  // Returns AnyAsset

// But AMM expects:
type CompatibleAsset = Asset | TokenAsset | SynthAsset | TradeAsset
```

**Impact:** TypeScript compilation fails even though code works at runtime.

**Fix Options:**
1. Add type assertion: `assetFromStringEx('ETH~ETH') as CompatibleAsset`
2. Create a helper function that validates and narrows the type
3. Update `assetFromStringEx` to return a narrower type when possible

---

## 6. Mock Files Missing Type Annotations (MINOR)

**Locations:**
- `packages/xchain-aggregator/__mocks__/mayachain/mayanode/api.ts`
- `packages/xchain-aggregator/__mocks__/mayachain/midgard/api.ts`
- `packages/xchain-aggregator/__mocks__/thorchain/midgard/api.ts`
- `packages/xchain-aggregator/__mocks__/thorchain/thornode/api.ts`
- `packages/xchain-bitcoin/__mocks__/axios-adapter.ts`
- `packages/xchain-bitcoincash/__mocks__/axios-adapter.ts`
- `packages/xchain-dash/__mocks__/dash-mocks.ts`
- `packages/xchain-doge/__mocks__/axios-adapter.ts`
- `packages/xchain-litecoin/__mocks__/axios-adapter.ts`

**Issue:** Callback parameters have implicit `any` type:

```typescript
// Current:
const mockAdapter = (file) => { ... }

// Should be:
const mockAdapter = (file: string) => { ... }
```

**Impact:** Strict TypeScript checking fails.

**Fix:** Add explicit type annotations to all mock callback parameters.

---

## 7. Documentation Gap: Cache Constructor Patterns

**Issue:** The relationship between Cache, Query, and AMM classes is not well documented. Users need to understand:

```
MidgardQuery (or MayaMidgardQuery)
     ↓
[Thor/Maya]chainCache (requires MidgardQuery + [Thor/Maya]node)
     ↓
[Thor/Maya]chainQuery (requires Cache)
     ↓
[Thor/Maya]chainAMM (requires Query + Wallet)
```

**Recommendation:** Add a "Getting Started" section to each AMM package README showing the full instantiation pattern.

---

## Priority Order for Fixes

1. **HIGH:** Fix MayachainQuery/ThorchainQuery constructor documentation and e2e tests (#2, #7)
2. **HIGH:** Fix MAYANameDetails property names in tests (#3)
3. **MEDIUM:** Fix Wallet.getAddress() API usage in tests (#1)
4. **MEDIUM:** Fix missing imports (#4)
5. **LOW:** Fix type assertions for AnyAsset (#5)
6. **LOW:** Fix mock type annotations (#6)

---

## Notes

- These issues were discovered while building the testing-gui tool
- Most issues are in e2e tests, not the core library code
- The core library appears functional, but documentation and test quality need improvement
- Consider running `npx tsc --noEmit` from the monorepo root periodically to catch these issues
