# @xchainjs/xchain-sui

## 0.2.0

### Minor Changes

- Migrate off deprecated Sui Foundation JSON-RPC fullnodes.
  - Default transport is **gRPC** against `fullnode.*.sui.io` (balances, fees, coins, transfer execution).
  - Transaction history uses **GraphQL** at `graphql.*.sui.io`.
  - Existing `clientUrls` to Foundation fullnodes remain valid as gRPC base URLs (no consumer URL change required for that case).
  - Optional `transport: 'jsonRpc'` for private nodes that still enable JSON-RPC.
  - Optional `grpcUrls` / `graphqlUrls` for explicit endpoint overrides.
  - See README for Asgardex / `clientUrls` migration notes and [JSON-RPC migration guide](https://docs.sui.io/develop/accessing-data/json-rpc-migration).

## 0.1.5

### Patch Changes

- Updated dependencies [4ec2e3e]
  - @xchainjs/xchain-crypto@1.0.8
  - @xchainjs/xchain-client@2.0.16


## 0.1.4

### Patch Changes

- Updated dependencies [dbdfc76]
  - @xchainjs/xchain-crypto@1.0.7
  - @xchainjs/xchain-client@2.0.15

## 0.1.3

### Patch Changes

- Updated dependencies [51569ce]
  - @xchainjs/xchain-client@2.0.14

## 0.1.2

### Patch Changes

- Updated dependencies [70acc68]
- Updated dependencies [5f92a68]
  - @xchainjs/xchain-client@2.0.13

## 0.1.1

### Patch Changes

- Updated dependencies [0246a01]
- Updated dependencies [c4682c4]
  - @xchainjs/xchain-client@2.0.12
  - @xchainjs/xchain-util@2.0.7
