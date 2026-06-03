---
'@xchainjs/xchain-mayachain-query': patch
'@xchainjs/xchain-mayachain-amm': patch
---

Add Cardano (ADA) support to MAYAChain swap estimation and execution. `MayachainQuery.getDustValues()` now includes an ADA entry (1 ADA), so `quoteSwap`/`estimateSwap` for ADA no longer throws `No dust value known for ADA chain` and returns a valid quote. `MayachainAMM` now registers an ADA client in its default wallet so ADA swaps can be executed (previously `getClient('ADA')` threw `Client not found for ADA chain`). ADA address validation was already supported.
