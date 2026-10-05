---
'@xchainjs/xchain-crypto': minor
---

Include the CTR IV in the keystore MAC (format version 2)

New keystores written by `encryptToKeyStore` use `version: 2` and compute
`blake2b(macKey || iv || ciphertext)` so an attacker cannot flip bits in the
decrypted plaintext by tampering with `cipherparams.iv` without invalidating
the MAC (#1721).

**Reading:** v1 keystores (`version: 1`, MAC over `macKey || ciphertext` only)
still decrypt unchanged.

**Writing:** newly created files are v2 and cannot be verified by older
`@xchainjs/xchain-crypto` releases that only check the v1 MAC layout. Existing
files are unaffected.
