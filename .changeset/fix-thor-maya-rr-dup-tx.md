---
'@xchainjs/xchain-thorchain': patch
'@xchainjs/xchain-mayachain': patch
'@xchainjs/xchain-cosmos': patch
'@xchainjs/xchain-kujira': patch
---

Fix duplicate transactions when round-robin retries after a sign-and-broadcast transport error by signing once and only round-robinning broadcast of the same signed bytes
