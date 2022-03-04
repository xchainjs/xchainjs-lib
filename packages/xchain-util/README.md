# `@xchainjs/xchain-util`

Utility helpers for XChain clients

## Modules (in alphabetical order)

- `asset` - Utilities for handling assets
- `async` - Utilities for `async` handling
- `bn` - Utilities for using `bignumber.js`
- `chain` - Utilities for multi-chain
- `string` - Utilities for strings

## Usage

**BigNumber**

```
import bn, {
  isValidBN,
  bnOrZero,
  validBNOrZero,
  formatBN,
  formatBNCurrency,
  fixedBN
} from '@xchainjs/xchain-util'
```

**Async**

```
import delay from '@xchainjs/xchain-util'
```

**Asset Helpers**

```
import {
  assetAmount,
  baseAmount,
  isAssetAmount,
  isBaseAmount,
  baseToAsset,
  assetToBase,
  formatAssetAmount,
  formatBaseAsAssetAmount,
  formatAssetAmountCurrency,
} from '@xchainjs/xchain-util'
```

## Installation

```
yarn add @xchainjs/xchain-util
```

The following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-util`.

```
yarn add bignumber.js
```
