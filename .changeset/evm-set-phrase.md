---
'@xchainjs/xchain-evm': patch
---

`setPhrase` returns the address at the requested wallet index. Calling it after `purgeClient` no longer throws before the signer exists. An invalid wallet index throws before the current signer is replaced.
