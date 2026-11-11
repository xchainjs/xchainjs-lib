---
'@xchainjs/xchain-bitcoin': patch
'@xchainjs/xchain-doge': patch
'@xchainjs/xchain-litecoin': patch
---

Security: pin `bitcoinjs-lib` to 6.1.8 (was `^6.1.7`, resolved to 6.1.7) for
[GHSA-8vv3-6qpc-gpw6](https://github.com/advisories/GHSA-8vv3-6qpc-gpw6) (critical, `>=6.0.0 <6.1.8`): duplicated
merkle nodes were not detected in block merkle-root checks. 6.1.8 only changes `Block`/`fastMerkleRoot`; address,
payment, transaction and PSBT signing code is unchanged. These packages do not use `Block` merkle validation.
