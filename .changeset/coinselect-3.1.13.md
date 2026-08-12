---
'@xchainjs/xchain-bitcoin': patch
'@xchainjs/xchain-bitcoincash': patch
'@xchainjs/xchain-dash': patch
'@xchainjs/xchain-doge': patch
'@xchainjs/xchain-litecoin': patch
---

Bump `coinselect` from 3.1.12 to 3.1.13 across UTXO chain packages.

3.1.13 only changes the `split` algorithm (treat `value: 0` as a fixed output, not a split target). XChain UTXO clients use `coinselect/accumulative.js`, which is identical between 3.1.12 and 3.1.13 — this is a hygiene/alignment bump with no intended selection behavior change for current call sites.
