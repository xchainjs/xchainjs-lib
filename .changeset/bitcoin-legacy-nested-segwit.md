---
'@xchainjs/xchain-bitcoin': minor
---

Add legacy (P2PKH) and nested segwit (P2SH-P2WPKH) address formats

The `AddressFormat` enum now supports `P2PKH` (BIP44 legacy, `1...` addresses) and
`P2SH_P2WPKH` (BIP49 nested segwit, `3...` addresses) in addition to the existing
`P2WPKH` and `P2TR`. Select a format via the `addressFormat` constructor param and pass
the matching paths exported as `legacyDerivationPaths` (`m/44'`) or
`nestedSegwitDerivationPaths` (`m/49'`) as `rootDerivationPaths`. Address derivation, PSBT
building/signing (keystore) and the Ledger client all honor the selected format. Existing
P2WPKH/P2TR behavior is unchanged.
