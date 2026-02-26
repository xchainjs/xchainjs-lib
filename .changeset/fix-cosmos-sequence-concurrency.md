---
'@xchainjs/xchain-cosmos-sdk': patch
'@xchainjs/xchain-thorchain': patch
'@xchainjs/xchain-mayachain': patch
---

Fix concurrent transaction sequence errors on Cosmos-based chains by serializing sign-and-broadcast operations per client instance
