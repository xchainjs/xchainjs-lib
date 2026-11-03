---
'@xchainjs/xchain-crypto': minor
---

Keystore v2: the MAC now also covers the IV (`blake2b(macKey || iv || ciphertext)`), fixing #1721. `encryptToKeyStore` writes `version: 2`; v1 keystores still decrypt. `decryptFromKeystore` now strictly validates `version`, `cipher`, `kdf`, `prf`, `dklen`, iteration count (1..2,000,000), IV length and salt before deriving a key, which also closes a MAC bypass via a short `dklen`. Adds `keystoreNeedsUpgrade()` so wallets can re-encrypt v1 keystores after a successful unlock. Keystores written by this version cannot be opened by older `xchain-crypto` releases.
