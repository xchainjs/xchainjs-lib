---
'@xchainjs/xchain-evm': patch
---

A transfer that sets only `maxFeePerGas` no longer copies a node tip above that cap, so the transaction can be signed. An explicit tip above `maxFeePerGas` is rejected.
