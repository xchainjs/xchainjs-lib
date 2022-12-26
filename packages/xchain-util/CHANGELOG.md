# v.0.12.0 (2022-12-25)

## Breaking change

- Remove `Asset*` definitions
- Change `Chain` enum to less strict `string` type
- Remove `isChain`, `eqChain`, `chainToString`, `is*Chain`,

# v.0.11.1 (2022-12-13)

## Add

- Add `register9Rheader()` to populate x-client-id header
# v.0.11.0 (2022-xx-xx)

## Breaking change

- Remove `Terra` from `Chain`
- Remove `AssetLUNA`

# v.0.10.0 (2022-09-29)

## Add

- Add `assestFromStringEx()` to raise an exceptions in case of failures

## Breaking change

- Revert previous changes of `assestFromString()` to return null in case of failures

# v.0.9.0 (2022-09-05)

## Breaking change

- moved `isAssetRuneNative()` into utils
- changed `assestFromString()` to not return null, instead throw parsing error

# v.0.8.1 (2022-08-15)

## Add

- added Avax chain and asset

## Remove

- Remove `Polkadot` from chain.test.ts
- Remove `Polkadot` from chain.ts

# v.0.8.0 (2022-07-20)

### Breaking change

- Removed `midgard.ts`, moved to xchain-midgard
- Removed types `InboundDetail`, `ServerInboundDetail`, moved to xchain-midgard
- removed dependency on "@xchainjs/xchain-client"

# v.0.7.1 (2022-05-05)

## Update

- Add new types `InboundDetail`, `ServerInboundDetail`
- Add `midgard.ts` to src
- Add `midgard` tests

# v.0.7.0 (2022-04-13)

### Add

- Helper `eqAsset`
- Estimate fees using any native Terra asset

### Breaking change

- Remove `AssetLuna` (will be supported by `xchain-terra`)

# v.0.6.1 (2022-04-04)

### Fix

- Support `UST` in `currencySymbolByAsset`

# v.0.6.0 (2022-02-04)

### Breaking change

- Rename `LUNAChain`-> `TerraChain` #482

# v.0.5.1 (2022-02-04)

### Add

- `Chain.Terra`
- `AssetLUNA`

# v.0.5.0 (2022-02-02)

### Breaking change

- Add `synth` property to `Asset`

### Update

- Support synths in `assetFromString` + `assetToString` helpers

### Add

- `isSynthAsset` helper

# v.0.4.0 (2022-01-19)

### Add

- `Chain.Doge`
- `AssetDOGE`

# v.0.3.1 (2021-07-14)

### Fix

- Fix `formatAssetAmountCurrency` for `XRUNE`

# v.0.3.0 (2021-07-07)

### Breaking changes

- Remove `chains` list (array)
- Introduce `Chain`, `Denomination` enums
- Extract `types` into different files (modules)

### Add

- Introduce `OnlyRequiredKeys` / `OnlyRequired` types

# v.0.2.7 (2021-03-16)

### Breaking changes

- Remove decimal of division result + Round down

# v.0.2.6 (2021-03-16)

### Update

- Extend BaseAmount/AssetAmount to support basic arithmetic operations(add, minus, times, div)
- Extend BaseAmount/AssetAmount to support basic comparison
- Add type guard `isBigNumberValue` for BigNumber.Value

# v.0.2.5 (2021-03-04)

### Breaking change

- Update `formatAssetAmountCurrency` to remove bracket.

# v.0.2.4 (2021-03-01)

### Update

- Update `chainToString` to support Bitcoin cash.

# v.0.2.3 (2021-02-09)

### Fix

- Added strict checks for undefined values at `formatAssetAmountCurrency` and `formatAssetAmount`

### Update

- Add `AssetBCH`

# v.0.2.2 (2021-01-30)

### Fix

- Clear lib folder on build
- Fixes linting from redeclaring Litecoin in chain consts twice

### Update

- add Bitcoin Cash chain const.
- add Litecoin chain const.

# v.0.2.1 (2021-01-08)

### Fix

- `assetToBase` ignores `decimal` #174

### Update

- Update comments for documentation

# v.0.2.0 (2020-12-11)

### Update

- Update dependencies
- Add chain const for `cosmos` and `polkadot`

### Breaking change

- Remove `swap`, `stake`, `memo` modules (to be part of `asgardex-utils` only)
