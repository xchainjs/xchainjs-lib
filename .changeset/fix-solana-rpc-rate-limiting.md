---
'@xchainjs/xchain-solana': patch
---

Fix RPC rate limiting in getTransactions by respecting limit/offset params and defaulting to 10 signatures instead of 1000
