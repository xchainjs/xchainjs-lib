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
  slipPercent: '0.0000',
  lpUnits: '609979466048',
  runeToAssetRatio: '12052.61823221',
  transactionFee: {
    assetFee: '⚡ 22,000',
    runeFee: 'ᚱ 0.02',
    totalFees: 'ᚱ 2.67157601'
  },
  estimatedWaitSeconds: 600
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
  slipPercent: '0.1346',
  lpUnits: '304958794428',
  runeToAssetRatio: '12053.83745005',
  transactionFee: {
    assetFee: '⚡ 22,000',
    runeFee: 'ᚱ 0.02',
    totalFees: 'ᚱ 2.67184424'
  },
  estimatedWaitSeconds: 6
}
✨  Done in 3.51s.
```

LP Withdraw
LP Position

### Estimate Remove Liquidity

