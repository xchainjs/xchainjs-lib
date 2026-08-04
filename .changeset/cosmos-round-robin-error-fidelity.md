---
'@xchainjs/xchain-cosmos-sdk': patch
'@xchainjs/xchain-thorchain': patch
'@xchainjs/xchain-mayachain': patch
'@xchainjs/xchain-cosmos': patch
'@xchainjs/xchain-kujira': patch
---

Preserve real RPC/chain errors in Cosmos round-robin helpers instead of always throwing a generic "No clients available" message. Non-retryable failures (e.g. insufficient funds) rethrow immediately; exhausted failover includes the last error as message + cause. `getTransaction` uses `TxNotFoundError` when the tx is missing on reachable nodes.
