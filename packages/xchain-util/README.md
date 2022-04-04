# `@xchainjs/xchain-util`

Utility helpers for XChain clients

## Modules (in alphabetical order)

- `asset` - Utilities for handling assets
- `async` - Utilities for `async` handling
- `bn` - Utilities for using `bignumber.js`
- `chain` - Utilities for multi-chain
- `string` - Utilities for strings

## Installation

```
yarn add @xchainjs/xchain-util
```
The following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-util`.

```
yarn add bignumber.js
```

## Basic example usage for Asset Helpers

Imports 
```ts
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

## Convert between Asset and base vice versa

Use the helper to convert between base amounts and Assets.
The Decimal represents the denomination of the asset. i.e BTC_DECIMAL = 8. 
These are normally a constant exported by the client.   
```ts
const assetConversions = async () => {

    let amountToTransfer = 0.01
    // convert to type baseAmount
    let amount = assetToBase(assetAmount(amountToTransfer, BTC_DECIMAL)) 
    console.log(`Amount has been converted to type base amount: ${JSON.stringify(amount)}`)
    // Convert back to asset amount
    let asset = (baseToAsset(amount).amount()) 
    console.log(`Converted back to ${asset}`)
}

```

## Format helpers for assets

```ts

// Imports 
import { 
    assetToBase,
    assetAmount, 
    formatAssetAmount,
    formatBaseAmount,
    formatBNCurrency,
    AssetBTC,
    AssetCurrencySymbol, 
    formatAssetAmountCurrency,
    currencySymbolByAsset, 
    AssetRuneNative,
    AssetETH,
    AssetLTC } from "@xchainjs/xchain-util"

// usage Example
const formatHelpers = async () => {
    let amountToTransfer = 0.01
    let Amount = assetToBase(assetAmount(amountToTransfer, DECIMAL))

    // Formats an `AssetAmount` into `string` based on decimal places
    let formatAsset = formatAssetAmount({ amount: assetAmount(amountToTransfer, BTC_DECIMAL), decimal: BTC_DECIMAL})  
    console.log(formatAsset)
    
    // Formats a `BaseAmount` value into a `string`
    let formatBase = formatBaseAmount(Amount)
    console.log(formatBase)

    // Formats a big number value by prefixing it with `$`
    let formatBN = formatBNCurrency(Amount.amount())
    console.log(formatBN)

    //  Formats an asset amount using its currency symbol
    let formatAssetCurrency = formatAssetAmountCurrency({ amount: assetAmount(amountToTransfer, BTC_DECIMAL), asset: AssetBTC, decimal: BTC_DECIMAL})
    console.log(formatAssetCurrency)

    // Returns Asset symbol from ticker. 
    let assetA = currencySymbolByAsset(AssetRuneNative)
    let assetB = currencySymbolByAsset(AssetBTC)
    let assetC = currencySymbolByAsset(AssetETH)
    let assetD = currencySymbolByAsset(AssetLTC)
     console.log(assetA, assetB, assetC, assetD)

    // Respective outputs
    /*0.01000000
    1,000,000
    $1,000,000.00
    ⚡ 1,000,000
    ᚱ ₿ Ξ LTC */
}
```

## BigNumber helper functions

```ts
// Imports
import { 
    bnOrZero,
    validBNOrZero,
    fixedBN} from "@xchainjs/xchain-util"

const bigNumberhelpers = async () => {
    
    let amountToTransfer = 0.01
    let Amount = assetToBase(assetAmount(amountToTransfer, DECIMAL))

    // Helper to create a big number from string or number If it fails to create a big number
    console.log(bnOrZero(amountToTransfer))

    // Helper to validate a possible BigNumber If the given value is invalid or undefined
    console.log(validBNOrZero(Amount.amount()))

    // Helper to get a fixed BigNumber
    console.log(fixedBN(Amount.amount()))
}

```

## Chain helper

```ts
//Imports
import { isChain } from from "@xchainjs/xchain-util"

const chain = async () => {
    // Type guard to check whether string is based on type Chain
    let thor = "THOR"
    console.log(isChain(thor)) // Returns true
}
```

## Async helper

```ts
//Imports
import delay from '@xchainjs/xchain-util'

// Helper to delay anything within an async function
const anyAsyncFunc = async () => {
     // do something
    console.log('before delay')
    // wait for 200ms
    await delay(200)
    // and do other things
    console.log('after delay')
    
}
```
