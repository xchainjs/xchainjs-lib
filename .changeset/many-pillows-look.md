---
'@xchainjs/xchain-bitcoincash': patch
---

Switched recipient address handling to use CashAddr format so it works properly with bitcore. Replaced BTC-style addresses with recipientCashAddress in transaction outputs, and updated change outputs to use CashAddr as well for consistency.
