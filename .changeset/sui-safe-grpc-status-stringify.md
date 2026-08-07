---
'@xchainjs/xchain-sui': patch
---

Fix production TypeError when reporting failed Sui gRPC executes: protobuf `ExecutionStatus` can include BigInt fields (e.g. `error.command`), and `JSON.stringify` throws "Do not know how to serialize a BigInt". Failure messages now prefer `error.description` and otherwise use a BigInt-safe stringify so callers see the on-chain error instead of a serialization crash.

Also fix native SUI transfers that only set the first coin object as gas payment: amounts larger than that single coin failed with `InsufficientCoinBalance` even when total wallet SUI was sufficient. All SUI coins are now passed to `setGasPayment` so the PTB can merge them and `splitCoins(tx.gas, …)` can use the full balance (minus gas).
