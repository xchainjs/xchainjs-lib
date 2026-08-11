---
'@xchainjs/xchain-evm': minor
'@xchainjs/xchain-ethereum': minor
---

Support `{index}` derivation-path template for Ledger Live / custom accounts

Derivation paths may now contain an `{index}` placeholder which is substituted with the
wallet index instead of appended. This enables Ledger Live accounts
(`m/44'/60'/{index}'/0/0`), where the hardened account index varies — previously the wallet
index could only vary the final unhardened position. Both the keystore and Ledger signers
honor the template, keeping their addresses consistent for the same config. xchain-ethereum
exports a ready-made `ledgerLiveDerivationPaths` constant. Paths without the placeholder are
unaffected; existing addresses are unchanged.
