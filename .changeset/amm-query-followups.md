---
'@xchainjs/xchain-thorchain-query': patch
'@xchainjs/xchain-midgard-query': patch
---

Classify a THORChain memo from its action field, and report pool ownership from the liquidity units that deposit would add.

Forward the Midgard actions txType filter. Look up saver positions for the requested address. Binance-peg BSC USDT and USDC fall back to 18 decimals.
