---
'@xchainjs/xchain-wallet': patch
---

`getFeeRates` rounds UTXO fee rates up instead of half-up (1.4 no longer becomes 1). `estimateTransferFees` uses `walletIndex` for the sender address and no longer swallows address errors into a zero-input estimate.
