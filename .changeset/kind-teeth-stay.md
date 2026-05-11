---
'@xchainjs/xchain-dash': patch
---

Fix retrieve PublicKeyHash. Fail fast when a UTXO is missing both `scriptPubKey` and `witnessUtxo.script` instead of silently building a transaction with an empty input script.
