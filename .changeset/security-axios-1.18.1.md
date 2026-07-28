---
'@xchainjs/xchain-aggregator': patch
'@xchainjs/xchain-bitcoin': patch
'@xchainjs/xchain-bitcoincash': patch
'@xchainjs/xchain-client': patch
'@xchainjs/xchain-cosmos': patch
'@xchainjs/xchain-dash': patch
'@xchainjs/xchain-doge': patch
'@xchainjs/xchain-evm': patch
'@xchainjs/xchain-evm-providers': patch
'@xchainjs/xchain-litecoin': patch
'@xchainjs/xchain-mayachain': patch
'@xchainjs/xchain-mayachain-amm': patch
'@xchainjs/xchain-mayachain-query': patch
'@xchainjs/xchain-mayamidgard': patch
'@xchainjs/xchain-mayamidgard-query': patch
'@xchainjs/xchain-mayanode': patch
'@xchainjs/xchain-midgard': patch
'@xchainjs/xchain-midgard-query': patch
'@xchainjs/xchain-thorchain': patch
'@xchainjs/xchain-thorchain-amm': patch
'@xchainjs/xchain-thorchain-query': patch
'@xchainjs/xchain-thornode': patch
'@xchainjs/xchain-utxo-providers': patch
'@xchainjs/zcash-js': patch
---

Bump direct `axios` dependency from 1.16.1 to 1.18.1 across all packages that declare it, and pin the same version in the root yarn resolutions. This closes GHSA-gcfj-64vw-6mp9 (Axios Node HTTP adapter can use an inherited proxy after interceptor config cloning; vulnerable range `>=1.15.2 <1.18.0`). Exact pin only — no caret range — so consumers and the monorepo do not float onto a compromised patch.
