---
'@xchainjs/xchain-crypto': major
---

**BREAKING:** Keystore v2 — the MAC now also covers the IV (`blake2b(macKey || iv || ciphertext)`), fixing #1721.

- **Older releases cannot read v2 keystores.** `encryptToKeyStore` now writes `version: 2`. Any `xchain-crypto` release without this change computes the v1 MAC and reports `Invalid password` for a v2 file. Upgrade the library everywhere before writing v2 keystores. v1 keystores still decrypt with this version.
- **`decryptFromKeystore` validates keystores strictly** before deriving a key, and throws `Invalid keystore: …` for anything unexpected. `version` must be 1 or 2, `cipher` must be `aes-128-ctr`, `kdf` must be `pbkdf2`, `prf` must be `hmac-sha256`, `kdfparams.dklen` must be exactly 32, and `kdfparams.c` must be an integer from 1 to 2,000,000, so keystores with `c` above 2,000,000 are now rejected. The IV must be 16 bytes of hex, and the salt, ciphertext and MAC must be non-empty hex. This also closes a MAC bypass via a short `dklen` and a hang via a huge iteration count.
- **Re-encrypt v1 keystores after a successful unlock.** v1 files keep the IV-less MAC until they are re-encrypted. Use the new `keystoreNeedsUpgrade(keystore)`: after `decryptFromKeystore` succeeds, if it returns true, call `encryptToKeyStore(phrase, password)` and persist the result.
