---
'@xchainjs/xchain-sui': patch
---

Omit a Sui token from balances and history when its decimals are unknown. A missing metadata record and a failed lookup are treated the same, so a token the address holds can be absent until the lookup succeeds. A reported decimal, including 0, is unchanged.
