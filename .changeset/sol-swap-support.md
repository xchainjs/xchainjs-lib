---
'@xchainjs/xchain-midgard-query': patch
'@xchainjs/xchain-thorchain-amm': patch
---

Fix SOL swap support: handle Midgard returning -1 decimals by falling back to hardcoded SOL decimals (9), and add SOL to BFT chain list so transfers execute correctly without getFeeRates.
