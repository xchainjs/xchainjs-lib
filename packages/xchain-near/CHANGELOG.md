# @xchainjs/xchain-near

## 0.3.3

### Patch Changes

- 94599ee: Sign a prepared NEAR transaction with the access key it already carries
- 085ce00: Read the NEP-141 transfer hash from the execution outcome. `ft_transfer` returns nothing, so reading the hash from `callFunction` failed after the transfer had already succeeded.

## 0.3.2

### Patch Changes

- 85b4b7f: Prefer FastNear's current keyless RPC hosts and drop 1rpc.io/near, which times out with Cloudflare 522. near-api-js stays on 7.3.1.

## 0.3.1

### Patch Changes

- Updated dependencies [02be848]
  - @xchainjs/xchain-client@2.0.18

## 0.3.0

### Minor Changes

- 8a36529: Add NEP-141 fungible token balances and transfers with automatic NEP-145 storage_deposit

## 0.2.0

### Minor Changes

- 968233e: Add NEAR Protocol client with implicit-account keystore, native balance/fees/transfer, and NearBlocks history

## 0.1.0

### Minor Changes

- Initial NEAR Protocol client: implicit-account keystore, native balance/fees/transfer, NearBlocks history.
