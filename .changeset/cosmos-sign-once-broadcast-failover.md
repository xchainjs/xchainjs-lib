---
'@xchainjs/xchain-cosmos-sdk': patch
'@xchainjs/xchain-thorchain': patch
'@xchainjs/xchain-mayachain': patch
'@xchainjs/xchain-cosmos': patch
'@xchainjs/xchain-kujira': patch
---

Harden deposit/transfer RPC failover so ambiguous transport failures cannot resign+rebroadcast.

`signAndBroadcast` wrapped in `roundRobinTry` previously retried the entire sign+broadcast on timeout/5xx. If node A accepted the tx but the HTTP response was lost, node B would sign again (often with the next account sequence) and create a second on-chain spend.

Fund-moving paths now use `signOnceThenRoundRobinBroadcast`: sign once, then round-robin broadcast of the **same** TxRaw bytes (idempotent). "tx already exists / already in mempool" is treated as success using the known hash. Read-only round-robin is unchanged.
