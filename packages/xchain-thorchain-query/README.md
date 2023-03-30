# `@xchainjs/xchain-thorchain-query`

Thorchain-query module to query thorchain for estimation of swaps/ add and remove Liquidity and checking a transaction stage. 
Returns a TxDetail object with all the information needed to conduct a swap, or add liquidity. This includes estimateAddSavers()

## Installation

```
yarn add @xchainjs/xchain-thorchain-query
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-thorchain-query`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-util @xchainjs/xchain-midgard @xchainjs/xchain-thornode axios

```

## Examples

Estimation example from a swap of 2 BTC to RUNE

```ts
{
  memo: '=:THOR.RUNE::2071168559999',
  expiry: 2022-09-07T02:16:45.732Z,
  toAddress: '',
  txEstimate: {
    input: '₿ 2',
    totalFees: {
      inboundFee: 'ᚱ 0.02',
      swapFee: 'ᚱ 52.85380999',
      outboundFee: 'ᚱ 0.06',
      affiliateFee: 'ᚱ 0'
    },
    slipPercentage: '0.00246920801878638026',
    netOutput: 'ᚱ 21,352.25318742',
    waitTimeSeconds: '1248',
    canSwap: true,
    errors: []
  }
}
```

Estimation of add symetric liquidity
```ts
{
  rune: 'ᚱ 12,000',
  asset: '⚡ 0',
  slipPercent: '0.0747',
  lpUnits: '154224962883',
  runeToAssetRatio: '20064.69985077',
  transactionFee: { assetFee: '⚡ 0', runeFee: 'ᚱ 0.02', totalFees: 'ᚱ 0.02' },
  estimatedWaitSeconds: 6,
  errors: [],
  canAdd: true
}
```

Estimation of remove Liquidity
```ts
{
  asset: { chain: 'BTC', symbol: 'BTC', ticker: 'BTC', synth: false },
  percentage: 100,
  assetAddress: 'bc1qufc5hvfvszphksqawadpc63ujarhjpn26je2jn',
  runeAddress: ''
}
{
  slipPercent: '0.0000',
  runeAmount: 'ᚱ 1,664,891.55918601',
  assetAmount: '₿ 83.01517361',
  inbound: {
    assetFee: '⚡ 10,000',
    runeFee: 'ᚱ 0.02',
    totalFees: 'ᚱ 2.02552681'
  },
  impermanentLossProtection: {
    ILProtection: CryptoAmount { asset: [Object], baseAmount: [Object] },
    totalDays: '346.62'
  },
  estimatedWaitSeconds: 8400
}
```

Estimation of Add Saver
```ts
{
  assetAmount: '₿ 0.5',
  estimatedDepositValue: '₿ 0.49937395',
  fee: {
    affiliateFee: '⚡ 0',
    asset: { chain: 'BTC', symbol: 'BTC', ticker: 'BTC', synth: true },
    outbound: '⚡ 0'
  },
  expiry: 2023-03-29T05:58:34.415Z,
  toAddress: 'bc1qucjrczghvwl5d66klz6npv7tshkpwpzlw0zzj8',
  memo: '+:BTC/BTC',
  estimateWaitTime: 600,
  saverCapFilledPercent: 266.3662135203711,
  slipBasisPoints: 12,
  canAdd: true,
  errors: []
}
```

## Documentation

[`Overview `](https://dev.thorchain.org/thorchain-dev/xchainjs-integration-guide/query-package)

For bash exmples, see example folder at the base of this repository xchainjs/xchainjs-lib/examples/liquidity.

### [`xchain-thorchain-query`](http://docs.xchainjs.org/xchain-thorchain-query/)

How xchain-thorchain-query works: http://docs.xchainjs.org/xchain-thorchain-query/how-it-works.html\
How to use xchain-thorchain-query: http://docs.xchainjs.org/xchain-thorchain-query/how-to-use.html

## For Live examples

Estimate swap: https://replit.com/@thorchain/estimateSwap#index.ts\
Estimate add: https://replit.com/@thorchain/estimateAddliquidity\
Estimate withdraw: https://replit.com/@thorchain/estimateWithdrawLiquidity\
Check liquidity: https://replit.com/@thorchain/checkLiquidity\
List pools: https://replit.com/@thorchain/listPools#package.json\
Get Network Values: https://replit.com/@thorchain/networkValues#index.ts\

Estimate AddSaver() & WithdrawSaver() & getSaverPosition() https://replit.com/@thorchain/quoteDepositTS#index.ts

Check transaction Stage 

### Setting Headers for Nine Realms endpoints

If you plan on using the publically accessible endpoints provided by Nine Realms(listed below), ensure that you add a valid 'x-client-id' to all requests

- https://midgard.ninerealms.com
- https://haskoin.ninerealms.com (BTC/BCH/LTC)
- https://thornode.ninerealms.com

## Example

```typescript
import cosmosclient from '@cosmos-client/core'
import axios from 'axios'
import { register9Rheader } from '@xchainjs/xchain-util'

register9Rheader(axios)
register9Rheader(cosmosclient.config.globalAxios)
```

For a complete example please see this [test](https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-thorchain-amm/__e2e__/wallet.e2e.ts)
