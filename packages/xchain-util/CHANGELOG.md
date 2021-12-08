# v.0.3.2 (2021-xx-xx)

### Add

- Add `Chain.ZCash` + `Asset.ZEC`

# v.0.3.1 (2021-07-14)

### Fix

- Fix `formatAssetAmountCurrency` for `XRUNE`

# v.0.3.0 (2021-07-07)

### Breaking changes

- Remove `chains` list (array)
- Introduce `Chain`, `Denomination` enums
- Extract `types` into different files (modules)

### Add

- Introduce `OnlyRequiredKeys` / `OnlyRequired` types

# v.0.2.7 (2021-03-16)

### Breaking changes

- Remove decimal of division result + Round down

# v.0.2.6 (2021-03-16)

### Update

- Extend BaseAmount/AssetAmount to support basic arithmetic operations(add, minus, times, div)
- Extend BaseAmount/AssetAmount to support basic comparison
- Add type guard `isBigNumberValue` for BigNumber.Value

# v.0.2.5 (2021-03-04)

### Breaking change

- Update `formatAssetAmountCurrency` to remove bracket.

# v.0.2.4 (2021-03-01)

### Update

- Update `chainToString` to support Bitcoin cash.

# v.0.2.3 (2021-02-09)

### Fix

- Added strict checks for undefined values at `formatAssetAmountCurrency` and `formatAssetAmount`

### Update

- Add `AssetBCH`

# v.0.2.2 (2021-01-30)

### Fix

- Clear lib folder on build
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
