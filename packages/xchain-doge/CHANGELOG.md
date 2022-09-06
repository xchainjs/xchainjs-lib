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
