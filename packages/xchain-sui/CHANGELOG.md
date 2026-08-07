# @xchainjs/xchain-sui

## 0.2.1

### Patch Changes

- ce7f4c1: Fix production TypeError when reporting failed Sui gRPC executes: protobuf `ExecutionStatus` can include BigInt fields (e.g. `error.command`), and `JSON.stringify` throws "Do not know how to serialize a BigInt". Failure messages now prefer `error.description` and otherwise use a BigInt-safe stringify so callers see the on-chain error instead of a serialization crash.

  Also fix native SUI transfers that only set the first coin object as gas payment: amounts larger than that single coin failed with `InsufficientCoinBalance` even when total wallet SUI was sufficient. All SUI coins are now passed to `setGasPayment` so the PTB can merge them and `splitCoins(tx.gas, …)` can use the full balance (minus gas).

## 0.2.0

### Minor Changes

- f8db6e5: Migrate `@xchainjs/xchain-sui` off deprecated Sui Foundation JSON-RPC fullnodes.

  Defaults now use **gRPC** (`fullnode.*.sui.io`) for balances, fees, coins, and execution, and **GraphQL** (`graphql.*.sui.io`) for transaction history. Existing `clientUrls` pointing at Foundation fullnodes continue to work as gRPC base URLs.

  Optional `transport: 'jsonRpc'` remains for private nodes that still enable JSON-RPC. New optional `grpcUrls` / `graphqlUrls` params allow overriding each endpoint.

### Patch Changes

- Updated dependencies [322b1bf]
- Updated dependencies [2e28cb5]
  - @xchainjs/xchain-client@2.0.17

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
