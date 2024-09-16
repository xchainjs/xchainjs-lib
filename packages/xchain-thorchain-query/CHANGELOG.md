# Changelog

## 1.0.4

### Patch Changes

- Updated dependencies [f90c0d8]
  - @xchainjs/xchain-util@1.0.3
  - @xchainjs/xchain-client@1.0.4
  - @xchainjs/xchain-midgard-query@1.0.4

## 1.0.3

### Patch Changes

- Updated dependencies [dec3ba3]
  - @xchainjs/xchain-util@1.0.2
  - @xchainjs/xchain-client@1.0.3
  - @xchainjs/xchain-midgard-query@1.0.3

## 1.0.2

### Patch Changes

- Updated dependencies [b07b69a]
  - @xchainjs/xchain-util@1.0.1
  - @xchainjs/xchain-client@1.0.2
  - @xchainjs/xchain-midgard-query@1.0.2

## 1.0.1

### Patch Changes

- 837e3e7: Axios version update to v1.7.4
- Updated dependencies [837e3e7]
- Updated dependencies [323cbea]
  - @xchainjs/xchain-midgard-query@1.0.1
  - @xchainjs/xchain-thornode@0.3.19
  - @xchainjs/xchain-client@1.0.1

## 1.0.0

### Major Changes

- c74614f: Methods and types updated with `Asset` type refactored.

### Patch Changes

- 20a1f7c: New method `getRunePool` for `ThorchainQuery` to retrieve Rune pool data.
- 20a1f7c: New method `getRunePoolProvider` for `ThorchainQuery` to return Rune pool provider data.
- bece78b: New method `getTradeAssetUnits` for `ThorchainQuery` to return the total units and depth of a trade asset.
- bece78b: New method `getTradeAssetAccounts` for `Thornode` to all trade accounts for an asset.
- 20a1f7c: New method `withdrawFromRunePool` for `ThorchainAMM` to withdraw from Rune pool.
- bece78b: New method `getTradeAssetsUnits` to return the total units and depth for each trade asset for `Thornode`.
- 20a1f7c: New method `estimateWithdrawFromRunePool` for `ThorchainAMM` to estimate the withdraw from Rune pool.
- 20a1f7c: New method `getRunePool` for `Thornode` to retrieve Rune pool data.
- bece78b: New method `getTradeAssetsUnits` for `ThorchainQuery` to return the total units and depth for each trade asset.
- bece78b: New method `getAddressTradeAccounts` for `ThorchainQuery` to return the units and depth of a trade account address.
- 20a1f7c: New method `getRunePoolProviders` for `Thornode` to return all Rune pool providers data.
- bece78b: New method `getTradeAssetsUnits` for `Thornode` to return the total units and depth for each trade asset.
- bece78b: New method `getTradeAssetUnits` for `Thornode` to return the total units and depth of a trade asset.
- 20a1f7c: New method `getRunePoolProviders` for `ThorchainQuery` to return all Rune pool providers data.
- 20a1f7c: New method `getRunePoolProvider` for `Thornode` to return Rune pool provider data.
- bece78b: New method `getTradeAssetAccount` for `Thornode` to the units and depth of a trade account address.
- bece78b: New method `getTradeAssetAccounts` for `ThorchainQuery` to return all trade accounts for a trade asset.
- Updated dependencies [c74614f]
  - @xchainjs/xchain-util@1.0.0
  - @xchainjs/xchain-midgard-query@1.0.0
  - @xchainjs/xchain-client@1.0.0
  - @xchainjs/xchain-thornode@0.3.18

## 0.7.17

### Patch Changes

- Updated dependencies [7d70a1c]
- Updated dependencies [7d70a1c]
  - @xchainjs/xchain-thornode@0.3.17
  - @xchainjs/xchain-midgard-query@0.1.20

## 0.7.16

### Patch Changes

- 7df3870: `estimateThorname` method updated. `QuoteThornameParams` params replace by `QuoteTHORNameParams`.

## 0.7.15

### Patch Changes

- Updated dependencies [99825cb]
- Updated dependencies [6fe2b21]
  - @xchainjs/xchain-thornode@0.3.16
  - @xchainjs/xchain-util@0.13.7
  - @xchainjs/xchain-client@0.16.8
  - @xchainjs/xchain-midgard-query@0.1.19

## 0.7.14

### Patch Changes

- 662085f: `Swap` type updated, `outboundTx` property is now optional
- 662085f: Outbound transaction bug fix in `getSwapHistory` method.

## 0.7.13

### Patch Changes

- Updated dependencies [8d000a2]
  - @xchainjs/xchain-client@0.16.7
  - @xchainjs/xchain-midgard-query@0.1.18

## 0.7.12

### Patch Changes

- 15181f4: Release fix
- Updated dependencies [15181f4]
  - @xchainjs/xchain-client@0.16.6
  - @xchainjs/xchain-midgard-query@0.1.17
  - @xchainjs/xchain-thornode@0.3.15
  - @xchainjs/xchain-util@0.13.6

## 0.7.11

### Patch Changes

- 582d682: Internal dependencies updated to use workspace nomenclature
- Updated dependencies [582d682]
  - @xchainjs/xchain-midgard-query@0.1.16
  - @xchainjs/xchain-thornode@0.3.14
  - @xchainjs/xchain-client@0.16.5
  - @xchainjs/xchain-util@0.13.5

## 0.7.10

### Patch Changes

- b93add9: Dependecies as external at building process
- Updated dependencies [b93add9]
  - @xchainjs/xchain-midgard-query@0.1.15
  - @xchainjs/xchain-thornode@0.3.13
  - @xchainjs/xchain-client@0.16.4
  - @xchainjs/xchain-util@0.13.4

## 0.7.9

### Patch Changes

- Updated dependencies [448c29f]
  - @xchainjs/xchain-client@0.16.3
  - @xchainjs/xchain-midgard-query@0.1.14

## 0.7.8

### Patch Changes

- Updated dependencies [b1dcd60]
  - @xchainjs/xchain-thornode@0.3.12
  - @xchainjs/xchain-midgard-query@0.1.13

## 0.7.7

### Patch Changes

- d72fe81: New method `getSwapHistory`
- Updated dependencies [d72fe81]
  - @xchainjs/xchain-midgard-query@0.1.12

## 0.7.6

### Patch Changes

- aa127f8: New optional parameter `refundAddress` for `getSwapQuote` method
- Updated dependencies [aa127f8]
  - @xchainjs/xchain-thornode@0.3.11

## 0.7.5

### Patch Changes

- 3aec134: Added error handling for a simple string response from thornode
- Updated dependencies [c71952d]
  - @xchainjs/xchain-util@0.13.3
  - @xchainjs/xchain-client@0.16.2
  - @xchainjs/xchain-midgard-query@0.1.11

## 0.7.4

### Patch Changes

- 5efae97: ThorchainQuery new method `getChainInboundDetails` for returning the inbound address details of a chain
- 5efae97: ThorchainQuery new method `getInboundDetails` for returning the inbound addresses details

## 0.7.3

### Patch Changes

- 9229e99: Update apis to the latest specs
- Updated dependencies [9229e99]
  - @xchainjs/xchain-thornode@0.3.10

## 0.7.2

### Patch Changes

- 04c87ae: Native decimal bug fix

## 0.7.1

### Patch Changes

- @xchainjs/xchain-client@0.16.1
- @xchainjs/xchain-midgard-query@0.1.10

## 0.7.0

### Minor Changes

- 390eefb: CryptoAmount type removed

## v0.6.15 (2023-12-12)

### Update

- Client dependency increased to 0.16.0
- Midgard query dependency increased to 0.1.9

## v0.6.14 (2023-12-03)

### Update

- Client and midgard-query dependencies updated

## v0.6.13 (2023-11-28)

### Update

- getSaverEstimateErrors() inboundFee error check

## v0.6.12 (2023-11-21)

### Update

- xchain-client dependency

## v0.6.11 (2023-11-16)

### Update

- Created method getAddressAsync
- update Midgard dep & thornode dep
- Remove param fromAddress from quoteSwapParams to align with latest thornode specs

## v0.6.10 (2023-11-07)

### Fix

- Trim memo for thorname registation

## v0.6.9 (2023-11-05)

### Update

- Public validateAmount function

## v0.6.8 (2023-11-04)

### Update

- midgard-query package from 0.1.3 to 0.1.4

## v0.6.7 (2023-11-03)

### Update

- Native asset for dustAmount and dustThreshold

## v0.6.6 (2023-10-31)

### Update

- Updated return object for estimateWithdraw(), added validate asset in QuoteSwap()

## v0.6.5 (2023-10-22)

### Update

- address comparion fix, previously failing case matching

## v0.6.4 (2023-10-19)

### Update

- standardising the response of getThornameDetails() in case Thorname is not registered

## v0.6.3 (2023-10-06)

### Update

- Update deps for thornode & midgard-query

## v0.6.2 (2023-09-24)

### Update

- Support transefer and renewal THORNames

## v0.6.1 (2023-09-18)

### Update

- New functions estimateThorname and getThornameDetails

## v0.6.0 (2023-09-10)

### Update

- Updated thornode deps, adjusted new return types and fee object
- New param thorchain-cache constructor: midgard-query

## v0.5.0 (2023-09-03)

### fix

- asset string changed to use symbol instead of ticker

### Update

- Reduce dependency from midgard extracting all code to midgard-xchain-query package
- Improve cache handling using CachedValue class

## v0.4.9 (2023-08-25)

### Update

- Fix asset comparison in query & update thornode dep

## v0.4.8 (2023-08-19)

### Update

- update Txdetails with Streaming swap seconds

## v0.4.7 (2023-08-03)

### Update

- Add new function getSaverPositions()

## v0.4.6 (2023-07-26)

### Update

- Update thornode dep, and fixed swapQuote error returns

## v0.4.5 (2023-06-28)

### Update

- Add logic for strict use of reccomended min amount in

## v0.4.4 (2023-06-21)

### Update

- Updated loan queries to match the latest Thornode requirements

## v0.4.3 (2023-05-22)

### Update

- Add new queries to support lending getLoanQuoteClose & getLoanQuoteOpen

## v0.4.2 (2023-05-18)

### Update

- Update client dependency

## v0.4.1 (2023-05-10)

### Fix

- Fixed savers filled capacity formula & outboundFee comparison logic in getSaverPosition()

## v0.4.0 (2023-05-03)

### Update

- integrated thornode endpoint quoteSwap(), removed unnecesary logic
- renamed estimateSwap() with quoteSwap()
- changed type SwapEstimate to match quote endpoint

## v0.3.0 (2023-05-02)

### Update

- update rollup config and axios to the latest
- update rimraf

## v0.2.6 (2023-4-24)

### Add

- Bump packages

## v0.2.5 (2023-4-14)

### Fix

- Savers Error handling

## v0.2.4 (2023-4-05)

### Fix

- Remove unused deps
- Declared asset conts
- Add logic for BSC & MAYA

## v0.2.3 (2023-4-05)

### Fix

- Bump deps

## v0.2.2 (2023-4-04)

### Fix

- Savers quote error
- Bump packages

## v0.2.1 (2023-3-29)

### Fix

- Synth bug `default` all synths to 8 decimals
- Savers baseAmount bug, removed `+pool.nativeDecimals`
- fix outboundfee calc

## v0.2.0 (2023-3-21)

### Fix

- update package deps
- Calculate network fee error
- Fix validate estimate swap error

## v0.1.19 (2023-3-03)

### Fix

- Add check to see if synth mint is paused
- Update dependencies

## v0.1.18 (2023-2-16)

### Fix

- Remove gas asset check in `calcNetwork`

## v0.1.17 (2023-2-6)

### Fix

- several fee calculation fixes

## v0.1.16 (2023-1-26)

### Fix

- Switch from deprecated Migard endpoints `v2/thorchain` to thornode `/thorchain`
- Update tests

## v0.1.15 (2023-01-25)

### Bug fix

- Fix bug with minL1 fee

## v0.1.14 (2023-01-25)

### Update

- Release alpha - check tx feature

## v0.1.13 (2022-12-29)

### Update

- Bump:`xchain-thornode@0.2.0`
- Fix: incorrect Chain in utils/swap.ts

## v0.1.12 (2022-12-27)

### Update

- Bump:
- `xchain-avax@0.1.3`
- `xchain-binance@5.6.6`
- `xchain-bitcoin@0.20.7`
- `xchain-bitcoincash@0.15.6`
- `xchain-client@0.13.5`
- `xchain-cosmos@0.20.6`
- `xchain-ethereum@0.27.6`
- `xchain-evm@0.1.3`
- `xchain-litecoin@0.10.8`
- `xchain-thorchain@0.27.7`
- `xchain-util@0.12.0`
- Change `Asset*` and `*Chain` imports from `xchain-util` to its respective `xchain-*`

## v0.1.11 (2022-12-16)

### fix

- use abbreviated asset names in swap memo

## v0.1.10 (2022-12-13)

### Udpate

- Bump dependencies

## v0.1.9 (2022-11-27)

### Udpate

- Bump dependencies

## v0.1.8 (2022-11-12)

### ADD

- Add `estimateAddSaver()` & `estimateWithdrawSaver()` & `getsaverPosition()`

### Update

- Use latest xchain-midgard@0.3.0

## v0.1.7 (2022-11-10)

### Fix

- added missing AVAX case in getDustValues()
- fixed BTC/BCH/LTC case statement

## v0.1.6 (2022-10-27)

### ADD

- Add Liquidity position growth calculations using the LUVI formula in `checkLiquidityPosition()`

### Fix

## v0.1.5 (2022-10-27)

### Fix

- Bug - Limit asset amount was not using 8 decimal places
- Bug - Swap to Synths was failing Pool Conversion
-

### Update

- Removed getInboundAddresses() from thorchainCache since it was redundant
- Renamed AffiliateFeePercent to AffiliateFeeBasisPoints in EstimateSwapParams
- Updated output decimals to us NativeDecimals from Pool data
- Created calcOutboundFee() to use thornode outbound_fee

## v0.1.4 (2022-10-17)

### Fix

- Bug - Limit asset amount was not using 8 decimal places
- Bug - outbound fee is now calculated correctly
- Bug - affiliate fee calculation fixed
- Bug - getPoolForAsset() changed to take both chain & ticker for lookup
- Bump dep on package `xchain-midgard`

### Add

- check input asset decimals match nativeDecimals in LiquidityPool.pool, or throw Error

## v0.1.3 (2022-10-17)

### Update

- default to mainnet and standard APIs with no arg constructor

## v0.1.2 (2022-10-11)

### Update

- Lp estimate add and witdraw

## v0.1.1 (2022-10-04)

### Update

- Bumped `xchain-utils` & `xchain-client`

## v0.1.0 (2022-10-03)

### Add

- Add and Remove Lp functions

## v0.1.0 (2022-10-03)

### Update

- Updated outboundfee calcs it now uses `/thorchain/inbound_addresses`, `outbound_fee`

## v0.1.0-beta2 (2022-09-29)

### Add

- Add estimate add & withdraw Liquidity
- Add Check Liquidity position

## v0.1.0-beta1 (2022-09-29)

### Update

- bumped deps on xchain-utils & xchain-client

## v0.1.0-beta (2022-09-15)

### Fix

- fixed math calcs to account for decimals

## v0.1.0-alpha1 (2022-09-07)

### Fix

- Updated EstimateSwapParam type
- Edited function `estimateSwap()` to include default parameters

## v0.1.0-alpha (2022-08-26)

### Module Created
