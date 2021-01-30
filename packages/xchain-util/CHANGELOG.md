# v.x.x.x

# v.0.2.2 (2021-01-30)

- Adds yarn clean to package.json prepublishOnly to clear lib folder before building and publishing to npm
- Fixes linting from redeclaring Litecoin in chain consts twice

### Update

- add Bitcoin Cash chain const.
- add Litecoin chain const.

# v.0.2.1 (2021-01-08)

### Fix

- `assetToBase` ignores `decimal` #174

### Update

- Update comments for documentation

# v.0.2.0 (2020-12-11)

### Update

- Update dependencies
- Add chain const for `cosmos` and `polkadot`

### Breaking change

- Remove `swap`, `stake`, `memo` modules (to be part of `asgardex-utils` only)
