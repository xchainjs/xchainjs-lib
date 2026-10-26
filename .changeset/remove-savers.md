---
'@xchainjs/xchain-thorchain-query': major
'@xchainjs/xchain-thorchain-amm': major
'@xchainjs/xchain-midgard-query': major
---

Remove Savers. THORChain and MAYAChain no longer support saver deposits, withdrawals, or position lookups.

`estimateAddSaver`, `estimateWithdrawSaver`, `getSaverPosition`, `addSaver`, and `withdrawSaver` are gone, along with the saver quote and position types. Synth liquidity memos such as `+:BTC/BTC` are no longer classified as saver transactions. Midgard saver position lookups are removed as well.
