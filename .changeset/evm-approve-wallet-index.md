---
'@xchainjs/xchain-evm': patch
---

Keystore approvals are signed with the requested wallet index. Every approval was signed by account 0, so any other account failed with a from-address mismatch.
