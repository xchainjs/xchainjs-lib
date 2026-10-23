---
'@xchainjs/xchain-evm': patch
---

`awaitTxConfirmed` rejects a mined revert and a transaction that never produces a receipt. A receipt is confirmed only when its status is success.
