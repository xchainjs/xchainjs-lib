---
'@xchainjs/xchain-avax': patch
'@xchainjs/xchain-bsc': patch
---

Avalanche and BSC no longer call Ankr at `.../undefined` when `ANKR_API_KEY` is unset. A set key still uses Ankr. Without a key, Avalanche uses the public Avalanche API and BSC mainnet uses the public Binance dataseed.
