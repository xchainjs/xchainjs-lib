---
'@xchainjs/xchain-monero': patch
---

Harden Monero client: sync getAddress/setPhrase, clear wallet state on purge, return unlocked balance from wallet-rpc getBalance, add getWalletBalanceDetail, and refuse transfers above unlocked