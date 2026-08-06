---
'@xchainjs/xchain-crypto': minor
---

Upgrade keystore encryption to AES-256-CTR (keystore format v2).

`encryptToKeyStore` now derives a 64-byte key via PBKDF2 (`dklen` 32 → 64) and splits it into an independent 32-byte AES-256 key and 32-byte MAC key, writing `cipher: "aes-256-ctr"` and `version: 2`. Previously it used `aes-128-ctr` with only the first 16 of 32 derived bytes as the AES key (the remaining 16 were the MAC key).

**Backward compatible (reading):** `decryptFromKeystore` derives the AES-key/MAC-key split from the keystore's own `cipher` and `dklen` fields, so existing v1 (`aes-128-ctr`, `dklen` 32) keystores continue to decrypt unchanged. No user action or migration is required to keep opening existing wallets.

**Forward-incompatible (writing) — note for integrators:** keystore files newly created by this version are `aes-256-ctr` / v2 and **cannot be opened by older `@xchainjs/xchain-crypto` releases** (older code hard-codes a 16-byte key slice and will throw on the 32-byte AES-256 key). Existing files are untouched and remain openable everywhere. If your app shares keystore files across components pinned to different `xchain-crypto` versions, upgrade them together before creating new keystores.

Security note: AES-128 had no known practical break, so this is a modernization to the expected standard for seed-phrase storage rather than a fix for an exploitable weakness. The AES-256-CTR path is also supported by `crypto-browserify`, so browser/Electron bundles are unaffected.
