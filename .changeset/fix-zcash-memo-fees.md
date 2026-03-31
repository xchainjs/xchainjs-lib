---
'@xchainjs/zcash-js': patch
'@xchainjs/xchain-zcash': patch
---

Fix memo fee double-counting in buildTx/prepareMaxTx and bypass in buildMaxTx by standardizing all codepaths to use getFee as the single source of truth for memo output slot calculation
