# Changelog

## 2.0.1

### Patch Changes

- 9370688: More dependency updates

## 2.0.0

### Major Changes

- 621a7a0: Major optimization

## 1.0.8

### Patch Changes

- 590c8eb: fix assetFromString util function
- 590c8eb: Fix broken assetFromString()

## 1.0.7

### Patch Changes

- f45246f: added secured asset types

## 1.0.6

### Patch Changes

- 0cf33cf: Rollup configuration. Interop option set to 'auto' for CommoJS output

## 1.0.5

### Patch Changes

- 33bfa40: Rollup update to latest version.

## 1.0.4

### Patch Changes

- 73b68ed: `assetFromString` can work with 'RUNE' alias

## 1.0.3

### Patch Changes

- f90c0d8: Refactor assetFromString and correct chain MAYA.MAYA

## 1.0.2

### Patch Changes

- dec3ba3: `assetFromString` bug fix with KUJI.USK asset

## 1.0.1

### Patch Changes

- b07b69a: New `isTokenAssetFunction`

## 1.0.0

### Major Changes

- c74614f: Asset type refactor. `synth` property removed and `type` property added to distinguish the type of the asset.
- c74614f: New types `AnyAsset` and `AssetType`, `AssetCryptoAmount`, `TokenAssetCryptoAmount` and `SynthAssetCryptoAmount`.
- c74614f: `Asset` type represents native assets.
- c74614f: `SynthAsset` represents synthetic assets that lives in networks like THORChain and MAYAChain.
- c74614f: `TokenAsset` represents tokens that lives in EVM and Cosmos networks but they are not the native ones.

### Patch Changes

- bece78b: New asset `TradeAsset`.
- bece78b: New crypto amount type `TradeAmount`.

## 0.13.7

### Patch Changes

- 6fe2b21: Added Cacao currency symbol 𐌂

## 0.13.6

### Patch Changes

- 15181f4: Release fix

## 0.13.5

### Patch Changes

- 582d682: Internal dependencies updated to use workspace nomenclature

## 0.13.4

### Patch Changes

- b93add9: Dependecies as external at building process

## 0.13.3

### Patch Changes

- c71952d: Added Dash/ltc/doge symbols to asset utils

## v0.13.2 (2023-09-23)

### Update

- Support no expirity time on cached-value class

## v0.13.1 (2023-09-03)

### Update

- Add CryptoAmount and CachedValue utilities

## v0.13.0 (2023-05-02)

### Update

- update rollup config and axios to the latest

## v.0.12.0 (2022-12-25)

### Breaking change

- Remove `Asset*` definitions
- Change `Chain` enum to less strict `string` type
- Remove `isChain`, `eqChain`, `chainToString`, `is*Chain`,

## v.0.11.1 (2022-12-13)

### Add

- Add `register9Rheader()` to populate x-client-id header

## v.0.11.0 (2022-xx-xx)

### Breaking change

- Remove `Terra` from `Chain`
- Remove `AssetLUNA`

## v.0.10.0 (2022-09-29)

### Add

- Add `assestFromStringEx()` to raise an exceptions in case of failures

### Breaking change

- Revert previous changes of `assestFromString()` to return null in case of failures

## v.0.9.0 (2022-09-05)

### Breaking change

- moved `isAssetRuneNative()` into utils
- changed `assestFromString()` to not return null, instead throw parsing error

## v.0.8.1 (2022-08-15)

### Add

- added Avax chain and asset

### Remove

- Remove `Polkadot` from chain.test.ts
- Remove `Polkadot` from chain.ts

## v.0.8.0 (2022-07-20)

#### Breaking change

- Removed `midgard.ts`, moved to xchain-midgard
- Removed types `InboundDetail`, `ServerInboundDetail`, moved to xchain-midgard
- removed dependency on "@xchainjs/xchain-client"

## v.0.7.1 (2022-05-05)

### Update

- Add new types `InboundDetail`, `ServerInboundDetail`
- Add `midgard.ts` to src
- Add `midgard` tests

## v.0.7.0 (2022-04-13)

#### Add

- Helper `eqAsset`
- Estimate fees using any native Terra asset

#### Breaking change

- Remove `AssetLuna` (will be supported by `xchain-terra`)

## v.0.6.1 (2022-04-04)

#### Fix

- Support `UST` in `currencySymbolByAsset`

## v.0.6.0 (2022-02-04)

#### Breaking change

- Rename `LUNAChain`-> `TerraChain` #482

## v.0.5.1 (2022-02-04)

#### Add

- `Chain.Terra`
- `AssetLUNA`

## v.0.5.0 (2022-02-02)

#### Breaking change

- Add `synth` property to `Asset`

#### Update

- Support synths in `assetFromString` + `assetToString` helpers

#### Add

- `isSynthAsset` helper

## v.0.4.0 (2022-01-19)

#### Add

- `Chain.Doge`
- `AssetDOGE`

## v.0.3.1 (2021-07-14)

#### Fix

- Fix `formatAssetAmountCurrency` for `XRUNE`

## v.0.3.0 (2021-07-07)

#### Breaking changes

- Remove `chains` list (array)
- Introduce `Chain`, `Denomination` enums
- Extract `types` into different files (modules)

#### Add

- Introduce `OnlyRequiredKeys` / `OnlyRequired` types

## v.0.2.7 (2021-03-16)

#### Breaking changes

- Remove decimal of division result + Round down

## v.0.2.6 (2021-03-16)

#### Update

- Extend BaseAmount/AssetAmount to support basic arithmetic operations(add, minus, times, div)
- Extend BaseAmount/AssetAmount to support basic comparison
- Add type guard `isBigNumberValue` for BigNumber.Value

## v.0.2.5 (2021-03-04)

#### Breaking change

- Update `formatAssetAmountCurrency` to remove bracket.

## v.0.2.4 (2021-03-01)

#### Update

- Update `chainToString` to support Bitcoin cash.

## v.0.2.3 (2021-02-09)

#### Fix

- Added strict checks for undefined values at `formatAssetAmountCurrency` and `formatAssetAmount`

#### Update

- Add `AssetBCH`

## v.0.2.2 (2021-01-30)

#### Fix

- Clear lib folder on build
- Fixes linting from redeclaring Litecoin in chain consts twice

#### Update

- add Bitcoin Cash chain const.
- add Litecoin chain const.

## v.0.2.1 (2021-01-08)

#### Fix

- `assetToBase` ignores `decimal` #174

#### Update

- Update comments for documentation

## v.0.2.0 (2020-12-11)

#### Update

- Update dependencies
- Add chain const for `cosmos` and `polkadot`

#### Breaking change

- Remove `swap`, `stake`, `memo` modules (to be part of `asgardex-utils` only)
