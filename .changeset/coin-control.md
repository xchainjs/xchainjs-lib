---
'@xchainjs/xchain-utxo': minor
'@xchainjs/xchain-bitcoin': minor
'@xchainjs/xchain-litecoin': minor
'@xchainjs/xchain-doge': minor
'@xchainjs/xchain-bitcoincash': minor
'@xchainjs/xchain-dash': minor
'@xchainjs/xchain-zcash': minor
---

Add coin control support to all UTXO chains

- Add public `getUTXOs()` method to base UTXO client for listing unspent outputs
- Add optional `selectedUtxos` parameter to `transfer`, `transferMax`, `prepareTxEnhanced`, `prepareMaxTx`, and related methods across all UTXO chain clients
- When `selectedUtxos` is provided, the specified UTXOs are used directly instead of fetching from chain, enabling manual coin selection
- Add Coin Control UI component in xchain-suite for browsing and selecting UTXOs
