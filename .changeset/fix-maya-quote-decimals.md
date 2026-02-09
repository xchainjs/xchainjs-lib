---
'@xchainjs/xchain-mayachain-query': patch
---

Fix MAYA.MAYA swap quote decimal handling - amounts were inflated 10,000x because getQuoteAssetDecimals returned 8 instead of 4 for MAYA.MAYA
