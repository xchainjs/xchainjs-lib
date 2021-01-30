# v.x.x.x (2021-XX-XX)

# v.0.2.3 (2021-01-30)

- Adds yarn clean to package.json prepublishOnly to clear lib folder before building and publishing to npm

### Update

- Update dependencies
- add `bip39.validatePhrase(phrase)` in `getSeed()`
- add `bip39.validatePhrase(phrase)` in `encryptToKeystore()`
- Update comments for documentation

### Breaking change

- remove `getAddress()`
- remove `getPublicKeyPair()`
- remove pub keys from key store meta-data

# v.0.2.2 (2020-11-23)

### Change

- Export content of `secp256k1`, `ed25519` and `utils` modules

# v.0.2.1 (2020-11-19)

### Change

- Removes check of word length in `getSeed`

# v.0.2.0 (2020-11-19)

### Breaking change

- Removes BIP phrase from mnemonicToSeedSync

### Change

- bumps version from previous merge
