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

Bump direct `axios` dependency from 1.15.2 to 1.16.1 across all packages that declare it. Also bumps `lodash` from `^4.18.0` to `4.18.1` in `@xchainjs/zcash-js`. This propagates the security fixes from the earlier yarn-resolutions PR to actual consumers of the published packages — root resolutions only affect builds within this repo, not what downstream installers receive. Closes axios prototype-pollution / NO_PROXY-bypass / SSRF / CRLF / DoS advisories (GHSA-* covering versions <1.16.1) and the lodash code-injection-via-template advisory for the affected published packages.
