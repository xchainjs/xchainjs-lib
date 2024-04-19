---
'@xchainjs/xchain-evm': patch
---

New optional parameter `isMemoEncoded` for `transfer`, `prepareTx` and `estimateGasLimit` methods. If it is set to true, memo will not be encoded by the funcions. False by default
