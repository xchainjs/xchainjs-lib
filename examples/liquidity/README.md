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
yarn estimateAddLiquidity mainnet 1 BTC.BTC 12052.61115075 THOR.RUNE

yarn run v1.22.17
$ npx ts-node add-liquidity.ts mainnet 1 BTC.BTC 12052.61115075 THOR.RUNE
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
yarn estimateAddLiquidity mainnet 1 BTC.BTC 0 THOR.RUNE

yarn run v1.22.17
$ npx ts-node add-liquidity.ts mainnet 1 BTC.BTC 0 THOR.RUNE
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
yarn estimateAddLiquidity mainnet 0 BTC.BTC 12052.61115075 THOR.RUNE

yarn run v1.22.17
$ npx ts-node add-liquidity.ts mainnet 0 BTC.BTC 12052.61115075 THOR.RUNE
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
yarn estimateWithdrawLiquidity mainnet BTC.BTC 100 bc1qufc5hvfvszphksqawadpc63ujarhjpn26je2jn

yarn run v1.22.17
$ npx ts-node withdraw-liquidity.ts mainnet BTC.BTC 100 bc1qufc5hvfvszphksqawadpc63ujarhjpn26je2jn
{
  asset: { chain: 'BTC', symbol: 'BTC', ticker: 'BTC', synth: false },
  percentage: 100,
  assetAddress: 'bc1qufc5hvfvszphksqawadpc63ujarhjpn26je2jn',
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
yarn checkLiquidity mainnet BTC.BTC bc1qufc5hvfvszphksqawadpc63ujarhjpn26je2jn

yarn run v1.22.18
$ npx ts-node check-liquidity.ts mainnet BTC.BTC bc1qufc5hvfvszphksqawadpc63ujarhjpn26je2jn

{
  address: 'bc1qufc5hvfvszphksqawadpc63ujarhjpn26je2jn',
  position: {
    asset: 'BTC.BTC',
    rune_address: 'thor1nkdpzamatx6u9xfga4nrhkgu4r6cd26xgsyhzw',
    asset_address: 'bc1qufc5hvfvszphksqawadpc63ujarhjpn26je2jn',
    last_add_height: 5194791,
    units: '42814765726730',
    pending_rune: '0',
    pending_asset: '0',
    rune_deposit_value: '51550243067780',
    asset_deposit_value: '10229454500'
  },
  poolShare: { assetShare: '₿ 69.17824308', runeShare: 'ᚱ 861,142.7681905' },
  impermanentLossProtection: { ILProtection: '10880967869653', totalDays: '163.38' }
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

### Check LP

yarn checkLiquidity mainnet BNB.BUSD-BD1 thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23u

```bash
yarn run v1.22.18
$ npx ts-node check-liquidity.ts mainnet BNB.BUSD-BD1 thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23u
{
  address: 'thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23u',
  position: {
    asset: 'BNB.BUSD-BD1',
    rune_address: 'thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23u',
    last_add_height: 7669042,
    units: '12228552',
    pending_rune: '0',
    pending_asset: '0',
    rune_deposit_value: '49999991',
    asset_deposit_value: '81151084'
  },
  poolShare: { assetShare: '$ 0.89821571', runeShare: 'ᚱ 0.55333876' },
  impermanentLossProtection: {
    ILProtection: CryptoAmount { asset: [Object], baseAmount: [Object] },
    totalDays: '0.00'
  }
}
✨  Done in 12.40s.
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
