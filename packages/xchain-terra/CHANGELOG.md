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
