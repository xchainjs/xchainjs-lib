---
'@xchainjs/xchain-sui': patch
---

Fix production TypeError when reporting failed Sui gRPC executes: protobuf `ExecutionStatus` can include BigInt fields (e.g. `error.command`), and `JSON.stringify` throws "Do not know how to serialize a BigInt". Failure messages now prefer `error.description` and otherwise use a BigInt-safe stringify so callers see the on-chain error instead of a serialization crash.
