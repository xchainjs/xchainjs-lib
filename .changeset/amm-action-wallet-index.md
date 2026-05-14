---
'@xchainjs/xchain-thorchain-amm': patch
'@xchainjs/xchain-mayachain-amm': patch
---

Thread `walletIndex` through `ThorchainAction.makeAction` and `MayachainAction.makeAction` so callers can target a non-zero account when initiating swaps, deposits, or other protocol actions. Previously the parameter was dropped on the floor and every action ran from `walletIndex` 0. Fixes #1372.
