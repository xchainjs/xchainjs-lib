---
'@xchainjs/xchain-evm': patch
---

`prepareTx` now serializes the gas limit and fee fields, so a signed raw transaction is not broadcast with gas limit 0. A token transfer that includes a memo throws before broadcast. Nonces are taken from the pending transaction count.
