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
  slipPercent: '0.1348',
  lpUnits: '304989822621',
  runeToAssetRatio: '12053.83340297',
  transactionFee: {
    assetFee: '⚡ 22,000',
    runeFee: 'ᚱ 0.02',
    totalFees: 'ᚱ 2.67184335'
  },
  estimatedWaitSeconds: 600
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

LP Withdraw
LP Position

### Estimate Remove Liquidity
