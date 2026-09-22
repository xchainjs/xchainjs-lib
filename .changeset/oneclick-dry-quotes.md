---
'@xchainjs/xchain-aggregator': minor
---

OneClick `estimateSwap` is quote-only (`dry: true`). `canSwap` follows a non-zero `amountOut`, so pricing no longer depends on a deposit address. Quote amounts are digit-only base-unit strings, which keeps 24-decimal NEAR amounts out of scientific notation. Call `Aggregator.requestOneClickDepositAddress` immediately before broadcast, transfer with your own signer, then `Aggregator.submitOneClickDeposit`. `doSwap` does those steps together. If registration fails after broadcast, retry `submitOneClickDeposit` with the same hash and deposit address instead of transferring again. Optional `oneClickReferral` is stamped on quote bodies, and rejected quote or submit responses include the API `message` or `error`. Chainflip quote amounts use the same integer formatting.
