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

Bump axios from 1.15.0 to 1.15.2 to patch high-severity advisories: GHSA-pmwg-cvhr-8vh7 (NO_PROXY loopback bypass), GHSA-q8qp-cvcw-x6jj (HTTP adapter prototype pollution), GHSA-pf86-5x62-jrwf (response/request prototype pollution gadgets), and GHSA-6chq-wfr3-2hj9 (header injection via prototype pollution).

Bump protobufjs from 6.11.4 to 7.5.5 in `@xchainjs/xchain-cosmos`, `@xchainjs/xchain-mayachain`, and `@xchainjs/xchain-thorchain` to patch GHSA-xq3m-2v4x-88gg (critical: arbitrary code execution).
