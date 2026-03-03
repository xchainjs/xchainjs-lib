---
'@xchainjs/xchain-evm': patch
---

Fix EVM approve for tokens like USDT that require resetting allowance to 0 before setting a new non-zero value. Add getAllowance utility function.
