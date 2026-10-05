---
'@xchainjs/zcash-js': patch
'@xchainjs/xchain-zcash': patch
---

Accept ZIP 320 TEX addresses (`tex1` / `textest1`) as transparent P2PKH recipients. A THORChain ZEC inbound address uses this encoding and spends with the same script as the `t1` it came from. Derived addresses stay Base58Check.
