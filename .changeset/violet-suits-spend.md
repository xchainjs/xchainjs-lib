---
'@xchainjs/xchain-bitcoin': patch
'@xchainjs/xchain-utxo': patch
---

Add enhanced tx building and new function `sendMax()`.

@xchainjs/xchain-bitcoin
- New APIs: `prepareTxEnhanced`, `buildTxEnhanced`, `prepareMaxTx`, `sendMax`.
- `ClientKeystore.transfer` and `ClientLedger.transfer` now use `prepareTxEnhanced` with default UTXO preferences (minimizeFee=true, avoidDust=true, minimizeInputs=false).
- Deprecate `buildTx` and `prepareTx` (backward compatible for now).

@xchainjs/xchain-utxo
- New modules exported: `UtxoError`, `UtxoErrorCode`, `UtxoTransactionValidator`, `UtxoSelector` (+ related types).
