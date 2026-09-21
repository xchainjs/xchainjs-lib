---
'@xchainjs/xchain-aggregator': minor
---

OneClick `estimateSwap` is quote-only (`dry: true`). `canSwap` follows a non-zero `amountOut`, so pricing no longer depends on a deposit address. Quote amounts are digit-only base-unit strings, which keeps 24-decimal NEAR amounts out of scientific notation. Call `Aggregator.requestOneClickDepositAddress` (or `doSwap`) immediately before broadcast to obtain a deposit address. Optional `oneClickReferral` is stamped on quote bodies, and rejected `/v0/quote` responses include the API `message` or `error`. Chainflip quote amounts use the same integer formatting.
