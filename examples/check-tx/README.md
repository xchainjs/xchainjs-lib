## Check Thorchain Transaction 2

## Environment

Make sure these are installed before running scripts

```bash
node --version v16.15.0
ts-node --version v10.7.0
```

tsconfig has already been set in the tsconfig.json

### Install

1. cd into examples/check-tx folder

```bash
cd examples/check-tx
yarn install
```

### Check Transaction

yarn checktx mainnet FF900F04B145799668AB9975E40C51E42024D8761330D2210DCC8447F44218AF

```bash


{
  txType: 'Swap',
  inboundObserved: {
    status: 'Observed_Consensus',
    date: 2023-02-01T22:09:15.429Z,
    block: 9378567,
    expectedConfirmationBlock: 9378567,
    expectedConfirmationDate: 2023-02-01T22:09:34.212Z,
    amount: CryptoAmount { asset: [Object], baseAmount: [Object] },
    fromAddress: 'thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23u',
    memo: '=:THOR.RUNE:thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23u:107393380:t:0'
  },
  swapInfo: {
    status: 'Complete',
    expectedOutBlock: 9378567,
    expectedOutDate: 2023-02-01T22:09:17.787Z,
    expectedAmountOut: CryptoAmount { asset: [Object], baseAmount: [Object] },
    confirmations: 276330,
    minimumAmountOut: CryptoAmount { asset: [Object], baseAmount: [Object] },
    affliateFee: CryptoAmount { asset: [Object], baseAmount: [Object] },
    toAddress: 'thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23u'
  }
}
```

yarn checktx mainnet 2FBA72412803D77FB04CFB13A9F6DFE725CC11B245F7AFCBECB4500BCF5847A8

```bash
{
  txType: 'Swap',
  inboundObserved: {
    status: 'Observed_Consensus',
    date: 2023-02-21T02:42:18.945Z,
    block: 9654897,
    expectedConfirmationBlock: 9654897,
    expectedConfirmationDate: 2023-02-21T02:42:19.741Z,
    amount: CryptoAmount { asset: [Object], baseAmount: [Object] },
    fromAddress: 'thor1t2pfscuq3ctgtf5h3x7p6zrjd7e0jcvuszyvt5',
    memo: 'SWAP:avax/avax:thor1t2pfscuq3ctgtf5h3x7p6zrjd7e0jcvuszyvt5:1426669469'
  },
  swapInfo: {
    status: 'Complete',
    expectedOutBlock: 9654897,
    expectedOutDate: 2023-02-21T02:42:21.347Z,
    expectedAmountOut: CryptoAmount { asset: [Object], baseAmount: [Object] },
    confirmations: 8,
    minimumAmountOut: CryptoAmount { asset: [Object], baseAmount: [Object] },
    affliateFee: CryptoAmount { asset: [Object], baseAmount: [Object] },
    toAddress: 'thor1t2pfscuq3ctgtf5h3x7p6zrjd7e0jcvuszyvt5'
  }
}
```
