---
'@xchainjs/zcash-js': minor
'@xchainjs/xchain-zcash': minor
---

Add buildMaxTx function for sweep/max-send transactions that use all UTXOs with no change output. Also fixes browser compatibility by replacing Buffer.writeBigInt64LE with a browser-compatible helper function.
