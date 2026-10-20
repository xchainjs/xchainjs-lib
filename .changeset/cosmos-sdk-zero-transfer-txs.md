---
'@xchainjs/xchain-cosmos-sdk': patch
---

`getTransactionData` no longer throws for successful transactions without transfer events (e.g. zero-amount THORChain/MAYAChain `MsgDeposit` such as UNBOND or LEAVE); it returns the tx with empty `from`/`to` and the chain's native asset. Transactions that failed on-chain now throw an error with their result code.
