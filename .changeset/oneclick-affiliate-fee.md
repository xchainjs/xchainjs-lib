---
'@xchainjs/xchain-aggregator': patch
---

Fix OneClick estimateSwap to populate fees.affiliateFee from echoed quoteRequest.appFees (falling back to configured affiliateBps) instead of always returning 0
