# `@xchainjs/xchain-util`

Utitity helpers for XChain clients

## Modules (in alphabetical order)

- `asset` - Utilities for handling assets
- `async` - Utitilies for `async` handling
- `bn` - Utitilies for using `bignumber.js`
- `chain` - Utilities for multi-chain
- `memo` - Utilities for memos
- `stake` - XYK formula calc for stake
- `string` - Utilities for strings
- `swap` - XYK formula calc for swap

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

**Calculations-Staking**

```
import {
  PoolData,
  getSwapOutput,
  getSwapOutputWithFee,
  getSwapInput,
  getSwapSlip,
  getSwapFee,
  getValueOfAssetInRune,
  getValueOfRuneInAsset,
  getDoubleSwapOutput,
  getDoubleSwapOutputWithFee,
  getDoubleSwapInput,
  getDoubleSwapSlip,
  getDoubleSwapFee,
  getValueOfAsset1InAsset2,
} from '@xchainjs/xchain-util'
```

**Calculations-Swapping**

```
import {
  UnitData,
  StakeData,
  getStakeUnits,
  getPoolShare,
  getSlipOnStake
} from '@xchainjs/xchain-util'
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
