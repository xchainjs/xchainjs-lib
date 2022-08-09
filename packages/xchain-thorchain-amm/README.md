# `@xchainjs/xchain-thorchain-amm`

## Modules

Thorchain AMM module


## Installation

```
yarn add @xchainjs/xchain-thorchain-amm
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-thorchain-amm`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util @xchainjs/xchain-cosmos axios @cosmos-client/core bech32-buffer
```

## Usage

### Estimating a swap from BTC -> BUSD

```typescript
import { Network } from '@xchainjs/xchain-client'
import { AssetBTC, assetAmount, assetFromString, assetToBase } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { CryptoAmount, EstimateSwapParams, Midgard, SwapEstimate, ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'

const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('bad asset')

function print(estimate: SwapEstimate, input: CryptoAmount) {
  const expanded = {
    input: input.formatedAssetString(),
    totalFees: {
      inboundFee: estimate.totalFees.inboundFee.formatedAssetString(),
      swapFee: estimate.totalFees.swapFee.formatedAssetString(),
      outboundFee: estimate.totalFees.outboundFee.formatedAssetString(),
      affiliateFee: estimate.totalFees.affiliateFee.formatedAssetString(),
    },
    slipPercentage: estimate.slipPercentage.toFixed(),
    netOutput: estimate.netOutput.formatedAssetString(),
    waitTimeSeconds: estimate.waitTimeSeconds.toFixed(),
    canSwap: estimate.canSwap,
    errors: estimate.errors,
  }
  console.log(expanded)
}
try {
  const midgard = new Midgard(Network.Mainnet) //defaults to mainnet
  const thorchainAmm = new ThorchainAMM(midgard)
  const swapParams: EstimateSwapParams = {
    input: new CryptoAmount(assetToBase(assetAmount('1')), AssetBTC),
    destinationAsset: BUSD,
    // affiliateFeePercent: 0.003, //optional
    slipLimit: new BigNumber('0.03'), //optional
  }
  const estimate = await thorchainAmm.estimateSwap(swapParams)
  print(estimate, swapParams.input)

  // convert fees (by defualt returned in RUNE) to a different asset (BUSD)
  const estimateInBusd = await thorchainAmm.getFeesIn(estimate.totalFees, BUSD)
  estimate.totalFees = estimateInBusd
  print(estimate, swapParams.input)
} catch (e) {
  console.error(e)
}

```

## output

```
===Estimate with fees in Rune===
 {
  input: '₿ 1',
  totalFees: {
    inboundFee: 'ᚱ 0.02165694',
    swapFee: 'ᚱ 69.57707207',
    outboundFee: 'ᚱ 0.03235451',
    affiliateFee: 'ᚱ 0'
  },
  slipPercentage: '0.00299630164689824336',
  netOutput: '$ 23,151.33630401',
  waitTimeSeconds: '1116',
  canSwap: true,
  errors: undefined
}
===Estimate with fees in BUSD===
{
  input: '₿ 1',
  totalFees: {
    inboundFee: '$ 0.05822673',
    swapFee: '$ 187.06454402',
    outboundFee: '$ 0.08698816',
    affiliateFee: '$ 0'
  },
  slipPercentage: '0.00299630164689824336',
  netOutput: '$ 23,151.33630401',
  waitTimeSeconds: '1116',
  canSwap: true,
  errors: undefined
}
```