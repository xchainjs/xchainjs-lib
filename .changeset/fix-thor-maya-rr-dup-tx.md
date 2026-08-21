---
'@xchainjs/xchain-cosmos-sdk': patch
'@xchainjs/xchain-thorchain': patch
'@xchainjs/xchain-mayachain': patch
'@xchainjs/xchain-cosmos': patch
'@xchainjs/xchain-kujira': patch
---

Harden deposit/transfer RPC failover so ambiguous transport failures cannot resign+rebroadcast.

`signAndBroadcast` wrapped in `roundRobinTry` previously retried the entire sign+broadcast on timeout/5xx. If node A accepted the tx but the HTTP response was lost, node B would sign again (often with the next account sequence) and create a second on-chain spend.

Fund-moving paths now sign once, then round-robin broadcast of the **same** TxRaw bytes (idempotent). Shared helper `signOnceThenRoundRobinBroadcast` is available in cosmos-sdk; clients use sign-once + `broadcastTx`. "tx already exists / already in mempool" is treated as success using the known hash (including Ledger/`broadcastTx` paths).
