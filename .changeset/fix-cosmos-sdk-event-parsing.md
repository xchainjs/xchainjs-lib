---
'@xchainjs/xchain-cosmos-sdk': patch
---

Fix getTransactionData event parsing: replace hardcoded .slice(7) with dynamic tx event delimiter, fix map key mismatch in transfer aggregation, add attribute guards, and prevent crash on empty results
