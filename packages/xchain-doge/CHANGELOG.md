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
