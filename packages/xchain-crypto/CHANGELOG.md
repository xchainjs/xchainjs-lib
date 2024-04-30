# Changelog

## 0.3.2

### Patch Changes

- b93add9: Dependecies as external at building process

## 0.3.1

### Patch Changes

- 7f7f543: bump crypto-js version (security)

## v0.3.0 (2023-05-02)

### Update

- update rollup config and axios to the latest

## v.0.2.7 (2023-03-10)

- Update dependencies

## v.0.2.6 (???)

- ???

## v.0.2.5 (2021-06-19)

- added support to use the generatePhrase() in node

## v.0.2.3 (2021-01-30)

- Clear lib folder on build

#### Update

- Update dependencies
- add `bip39.validatePhrase(phrase)` in `getSeed()`
- add `bip39.validatePhrase(phrase)` in `encryptToKeystore()`
- Update comments for documentation

#### Breaking change

- remove `getAddress()`
- remove `getPublicKeyPair()`
- remove pub keys from key store meta-data

## v.0.2.2 (2020-11-23)

#### Change

- Export content of `secp256k1`, `ed25519` and `utils` modules

## v.0.2.1 (2020-11-19)

#### Change

- Removes check of word length in `getSeed`

## v.0.2.0 (2020-11-19)

#### Breaking change

- Removes BIP phrase from mnemonicToSeedSync

#### Change

- bumps version from previous merge
