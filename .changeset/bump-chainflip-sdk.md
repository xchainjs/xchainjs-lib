---
'@xchainjs/xchain-aggregator': minor
---

Bump @chainflip/sdk from 1.11.2 to 2.0.3 and fix aggregator bugs

- Bump @chainflip/sdk to 2.0.3
- Fix operator precedence bug in totalSwapSeconds calculation for Thorchain and Mayachain protocols
- Fix empty quotes check in Aggregator.estimateSwap()
- Map config.network to Chainflip network instead of hardcoding mainnet
- Deduplicate identical DCA/REGULAR deposit address request branches
