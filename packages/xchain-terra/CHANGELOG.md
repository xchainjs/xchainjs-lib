# v.0.3.1 (2022-09-29)

## Update

- bumped deps on xchain-utils & xchain-client

# v.0.2.0 (2022-07-20)

### Breaking change

- client.deposit() removed, all thorchain deposits were moved to xchain-thorchain-amm

# v.0.1.2 (2022-05-05)

## Update

- Add `deposit` function to Terra `Client`
- Update latest dependencies
- Add tests for `deposit`

# v.0.1.1 (2022-04-27)

## Fix

- `coinsToBalances` adds `null` for invalid `Asset`s #559

# v.0.1.0 (2022-04-19)

Official release - includes everything from `v.0.1.0-alpha.1` to `v.0.1.0-alpha.8`

# v.0.1.0-alpha.8 (2022-04-19)

## Add

- Add `getConfig` to `Client`
- Improve internal handling of fees in `transfer`

## Breaking change

- Remove `estimatedGas` param in `transfer` in favour to accept optional `feeAsset`, `feeAmount` and `gasLimit`

# v.0.1.0-alpha.7 (2022-04-15)

## Add

- Add optional `estimatedFee` param to `transfer` to pay fees in any other Terra native asset
- Add `getEstimatedFee` to `Client`

## Breaking change

- `getEstimatedFee` (in `util`) returns `Promise<EstimatedFee>`

# v.0.1.0-alpha.6 (2022-04-13)

## Add

- Helper `getEstimatedFee` to estimate fees based on any (not just LUNA) Terra native asset
- More fee / account helpers: `getAccount`, `calcFee`, `gasPriceToCoins`, `gasPricesToCoins`, `getGasPrices`, `getGasPriceByAsset`
- More asset helpers: `isAssetUST`, `getTerraNativeAsset`, `isTerraNativeAsset`, `getTerraNativeDenom`
- Add `Denom` + `FeesResponse` types

## Update

- Improve `isTerraNativeAsset` check

## Fix

- Fix fee convertion #544
- Fix import of `xchain-client|util`

## Breaking change

- Rename `getTerraMicroDenom` -> `getTerraNativeDenom`
- Remove `TerraNativeAsset` + `DENOM_MAP` in favour of `getTerraNativeAsset`

# v.0.1.0-alpha.5 (2022-04-03)

## Add

- Helper `getPrefix`
- Helper `getDefaultFees`

## Update

- `Client.getFees` returns default fees in case of failure (similar to other xchain-\* clients)

# v.0.1.0-alpha.4 (2022-04-02)

## Add

- Helper `getDefaultClientConfig`
- Helper `getTerraChains`
- Helper `getDefaultRootDerivationPaths`

## Fix

- Fix destructering of default config in `Client` constructor to override values properly

## Breaking change

- Extract client related types from `client` to `types/client` (incl. some renaming)
- Rename `ChainID` -> `chainID` in `ClientParams`

# v.0.1.0-alpha.3 (2022-03-28)

## FIX

- Fix `getExplorerTxUrl` returning `explorerAddressURL`

## Update

- Improve handling in `transfer`

# v.0.1.0-alpha.2 (2022-02-04)

## Add

- `TERRA_DECIMAL` #481
- helper `isTerraNativeAsset`

## Update

- `xchain-util@0.6.0`

## Fix

- Fix chain in constructor #483

## Breaking change

- `getTerraMicroDenom` returns null for invalid denominations

# v.0.1.0-alpha.1 (2022-02-04)

Initial release
