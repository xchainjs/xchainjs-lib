## Thorchain Estimate and ADD/Withdraw Example

## Environment

Make sure these are installed before running scripts

```bash
node --version v16.15.0
ts-node --version v10.7.0
```

tsconfig has already been set in the tsconfig.json

### Install

1. cd into examples/liquidity folder

```bash
cd examples/liquidity
yarn install
```

### Estimate Add Liquidity

#### example: estimate a symmetrical add (equal amount of BTC & Rune)

```bash
yarn estimateAddLiquidity mainnet 12052.61115075 THOR.RUNE 1 8 BTC.BTC

yarn run v1.22.17
$ npx ts-node add-liquidity.ts mainnet 12052.61115075 THOR.RUNE 1 8 BTC.BTC
{
  input1: '₿ 1',
  input2: 'ᚱ 12,052.61115075',
  slipPercent: '0.0027',
  lpUnits: '612042953364',
  runeToAssetRatio: '12293.08677329',
  transactionFee: {
    assetFee: '⚡ 15,000',
    runeFee: 'ᚱ 0.02',
    totalFees: 'ᚱ 1.86396302'
  },
  estimatedWaitSeconds: 600,
  errors: [],
  canAdd: true
}
✨  Done in 3.50s.

```

#### example: estimate an asymmetrical add (1 BTC & 0 Rune)

```bash
yarn estimateAddLiquidity mainnet 0 THOR.RUNE 1 8 BTC.BTC 

yarn run v1.22.17
$ npx ts-node add-liquidity.ts mainnet 0 THOR.RUNE 1 8 BTC.BTC 
{
  input1: '₿ 1',
  input2: 'ᚱ 0',
  slipPercent: '0.1365',
  lpUnits: '309345719997',
  runeToAssetRatio: '12428.10534753',
  transactionFee: {
    assetFee: '⚡ 10,000',
    runeFee: 'ᚱ 0.02',
    totalFees: 'ᚱ 1.26281053'
  },
  estimatedWaitSeconds: 600,
  errors: [],
  canAdd: true
}
✨  Done in 4.24s.

```

#### example: estimate an asymmetrical add (0 BTC & 12052.61115075 Rune)

```bash
yarn estimateAddLiquidity mainnet 12052.61115075 THOR.RUNE 0 8 BTC.BTC 

yarn run v1.22.17
$ npx ts-node add-liquidity.ts mainnet 12052.61115075 THOR.RUNE 0 8 BTC.BTC 
{
  input1: '⚡ 0',
  input2: 'ᚱ 12,052.61115075',
  slipPercent: '0.1335',
  lpUnits: '303091229273',
  runeToAssetRatio: '12289.33537974',
  transactionFee: {
    assetFee: '⚡ 16,000',
    runeFee: 'ᚱ 0.02',
    totalFees: 'ᚱ 1.98629366'
  },
  estimatedWaitSeconds: 6,
  errors: [],
  canAdd: true
}
✨  Done in 3.51s.
```

### Estimate Withdraw Liquidity

```bash
yarn estimateWithdrawLiquidity mainnet BTC.BTC 100 bc1qzugwrq3wmzky9eceucyxfytvnmqydddhh7sjy5

yarn run v1.22.17
$ npx ts-node withdraw-liquidity.ts mainnet BTC.BTC 100 bc1qzugwrq3wmzky9eceucyxfytvnmqydddhh7sjy5
{
  asset: { chain: 'BTC', symbol: 'BTC', ticker: 'BTC', synth: false },
  percentage: 100,
  assetAddress: 'bc1qzugwrq3wmzky9eceucyxfytvnmqydddhh7sjy5',
  runeAddress: ''
}
{
  slipPercent: '0.0000',
  runeAmount: 'ᚱ 861,765.04943902',
  assetAmount: '₿ 69.17824308',
  transactionFee: { assetFee: '⚡ 10,000', runeFee: 'ᚱ 0', totalFees: 'ᚱ 1.24571688' },
  impermanentLossProtection: { ILProtection: 'ᚱ 108,273.3706341', totalDays: '163.38' },
  estimatedWaitSeconds: 7200
}
```

### Check Liquidity Position

```bash
yarn checkLiquidity mainnet BTC.BTC bc1qzugwrq3wmzky9eceucyxfytvnmqydddhh7sjy5

yarn run v1.22.18
$ npx ts-node check-liquidity.ts mainnet BTC.BTC bc1qzugwrq3wmzky9eceucyxfytvnmqydddhh7sjy5

{
  address: 'bc1qzugwrq3wmzky9eceucyxfytvnmqydddhh7sjy5',
  position: {
    asset: 'BTC.BTC',
    rune_address: 'thor1nkdpzamatx6u9xfga4nrhkgu4r6cd26xgsyhzw',
    asset_address: 'bc1qzugwrq3wmzky9eceucyxfytvnmqydddhh7sjy5',
    last_add_height: 5194791,
    units: '42814765726730',
    pending_rune: '0',
    pending_asset: '0',
    rune_deposit_value: '51550243067780',
    asset_deposit_value: '10229454500'
  },
  poolShare: { assetShare: '₿ 68.37127412', runeShare: 'ᚱ 860,339.42808863' },
  impermanentLossProtection: { ILProtection: 'ᚱ 145,057.94923468', totalDays: '176.83' }
}
```

### Add liquidity

Provide both assets for the pool. lp type is determined from the amount of the asset. below is a representation of a single sided rune deposit

```bash
yarn addLiquidity "MnemonicPhrase" mainnet 1 THOR.RUNE 0 BNB.BUSD-BD1
[
  {
    hash: '49182D8970E6D0B27A37733C7C2A30D307F036B33FA3525063D4BD769D7B20D7',
    url: 'https://viewblock.io/thorchain/tx/49182D8970E6D0B27A37733C7C2A30D307F036B33FA3525063D4BD769D7B20D7',
    waitTimeSeconds: 6
  }
]
✨  Done in 9.88s.
```

### Remove Liquidity

withdraws the above position. single sided rune only
provide percentage only. 0 - 100.

```bash
yarn withdrawLiquidity "MnemonicPhrase" mainnet BNB.BUSD-BD1 100 thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23u

[
  {
    hash: '46DC1C38F61DFED521BCED9C999F1BFF1F89409A80840CE71C9EA096038FFE11',
    url: 'https://viewblock.io/thorchain/tx/46DC1C38F61DFED521BCED9C999F1BFF1F89409A80840CE71C9EA096038FFE11',
    waitTimeSeconds: 6
  }
]
✨  Done in 25.28s.


```

### Estimate Add Saver

Asset and asset amount to add to saver, asset decimals,

```bash
yarn estimateAddSaver mainnet 1 8 BTC.BTC
{
  assetAmount: '₿ 1',
  estimatedDepositValue: '₿ 0.99692917',
  fee: {
    affiliateFee: '⚡ 0',
    asset: { chain: 'BTC', symbol: 'BTC', ticker: 'BTC', synth: true },
    outbound: '⚡ 0'
  },
  expiry: 2022-11-16T04:40:47.080Z,
  toAddress: 'bc1qlccxv985m20qvd8g5yp6g9lc0wlc70v6zlalz8',
  memo: '+:BTC/BTC',
  estimateWaitTime: 600,
  saverCapFilledPercent: 18.789011861252053,
  slipBasisPoints: 30,
  canAdd: true,
  errors: []
}
```

### Add Saver

Asset and asset amount to add to saver, asset decimals,

```bash
yarn addSaver "MnemonicPhrase" mainnet  0.01 8 BNB.BNB
{
  expiry: 2022-11-14T04:12:49.724Z,
  toAddress: 'bnb1jzwjvflzc2jca0345lxrr3dkzr7fq32jve3e77',
  memo: '+:BNB/BNB',
  estimatedWaitTime: 6,
  canAddSaver: true
}
{
  hash: '60A352A78E87851958D0B02AF31987ED4CDF3E8F3B87FAD036E1F8FFAF3ED8A8',
  url: 'https://explorer.binance.org/tx/60A352A78E87851958D0B02AF31987ED4CDF3E8F3B87FAD036E1F8FFAF3ED8A8',
  waitTimeSeconds: 6
}
```

### Withdraw Savers

Asset, address and withdrawal basis points 10000 = 100%

```bash
yarn withdrawSaver "MnemonicPhrase" mainnet BNB.BNB "address" 10000

{
  hash: 'C0F9E71D42B9DAEF2412268775CE062F4291ED49EA7C9399BD7204147EB72B09',
  url: 'https://explorer.binance.org/tx/C0F9E71D42B9DAEF2412268775CE062F4291ED49EA7C9399BD7204147EB72B09',
  waitTimeSeconds: 0
}

```

### Estimate Withdraw Savers

Asset, address and withdrawal basis points 10000 = 100%

```bash
yarn estimateWithdrawSaver mainnet 15qwKqmicfvTNb5aqX3Nq4dfMEYdDo5Wsm BTC.BTC 10000
{
  assetAmount: '0.04641913 BNB',
  fee: {
    affiliate: '0 BNB',
    asset: { chain: 'BNB', symbol: 'BNB', ticker: 'BNB', synth: false },
    outbound: '0.0035874 BNB'
  },
  expiry: 2022-11-16T04:43:10.229Z,
  toAddress: 'bnb16vfpjv795hv3zpxd4qs7qshh6fcrarn7cp7mnz',
  memo: '-:BNB/BNB:10000',
  estimateWaitTime: 0,
  slipBasisPoints: 0
}
```

### Check saver position

network, address, asset string.

```bash
yarn checkSaverPosition mainnet 15qwKqmicfvTNb5aqX3Nq4dfMEYdDo5Wsm BTC.BTC
{
  depositValue: '0.04999961 BNB',
  redeemableValue: '0.05000693 BNB',
  lastAddHeight: 8225368,
  percentageGrowth: 0.01464,
  ageInYears: 0.003664383561643836,
  ageInDays: 1.3375000000000001
}
✨  Done in 3.64s.
```
