# v0.6.1 (2023-05-18)

## Add

- New client function getAssetInfo() returns chain, decimals and asset

# v0.6.0 (2023-05-02)

## Update

- update rollup config and axios to the latest
- update `bitcoinjs-lib` to the latest

# v.0.5.13 (2023-04-11)

## Add

- bump deps

# v.0.5.12 (2023-04-05)

## Add

- Add async `broadcastTx()` to client
- bump xchain-client deps

# v.0.5.11 (2023-04-03)

## Fix

- remove references to process.env in runtime code

# v.0.5.10 (2023-03-29)

## Update

- Update deps

# v.0.5.9 (2023-03-21)

## Update

- Update to use `xchain-uxto-providers`

# v.0.5.8 (2023-02-08)

## Update

- add support for sochain v3 API

# v.0.5.7 (2023-01-19)

## Update

- Type safety `DOGEChain`

# v.0.5.6 (2022-12-27)

## Add

- Add `AssetDOGE` and `DOGEChain` definition

## Update

- Bump `xchain-client@13.5.0`

# v.0.5.5 (2022-11-24)

## Update

- Bumped dependencies

# v.0.5.4 (2022-10-14)

## Update

- Set Default network to `Network.Mainnet`

# v.0.5.3 (2022-10-04)

## Update

- Bumped `xchain-utils` & `xchain-client`

# v.0.5.2 (2022-09-29)

## Update

- bumped deps on xchain-utils & xchain-client

# v.0.5.1 (2022-09-27)

## Fix

- Increase value for `setMaximumFeeRate` to reflect current fees

# v.0.5.0 (2022-09-05)

## Update

- bumped deps on xchain-utils & xchain-client

# v.0.3.0 (2022-07-21)

- client.deposit() removed, all thorchain deposits were moved to xchain-thorchain-amm

# v.0.2.1 (2022-05-05)

## Update

- Add `deposit` function to Doge `Client`
- Update latest dependencies
- Add tests for `deposit`

## Fix

- Fix import of `xchain-client`

# v.0.2.0 (2022-03-23)

## Update

- Fetch `txHex` optionally by scanning UTXOs #489
- Cache list of `txHex`s in `getTxHexFromCache` to avoid same requests for same data #490
- Export `buildTx` (from `utils`) and `getSendTxUrl` (from `blockcypher-api`)

## Breaking change

- Remove unspecific `AddressParams` type

# v.0.1.2 (2022-02-04)

- Use latest axios@0.25.0
- xchain-client@0.11.1
- @xchainjs/xchain-util@0.5.1

# v.0.1.1 (2022-01-19)

## ADD

- Add `getPrefix` to `utils`

## REMOVE

- Remove `nodeUrl` from Client constructor

# v.0.1.0 (2022-01-15)

First release
