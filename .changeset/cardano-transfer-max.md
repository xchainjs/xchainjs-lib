---
'@xchainjs/xchain-cardano': minor
---

Add `Client.transferMax({ recipient, memo, walletIndex })` to sweep the entire spendable ADA balance to a recipient in one call. The method wraps `prepareMaxTx`, signs, and broadcasts, returning `{ hash, maxAmount, fee }` where `maxAmount` and `fee` are lovelace numbers — matching the shape used by `xchain-bitcoin`'s `transferMax`. This lets callers surface what was actually swept without recomputing the fee. The signing path is factored into a private helper shared with `transfer()`, so the existing `LOWER_FEE_BOUND`/`UPPER_FEE_BOUND` checks apply to both.
