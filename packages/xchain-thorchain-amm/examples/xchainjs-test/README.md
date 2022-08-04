## Thorchain amm examples folder

## Environment

Make sure these are install before running scripts

node --version v16.15.0
ts-node --version v10.7.0

tsconfig has already been set in the tsconfig.json

### How to use

1. cd into examples/xchainjs-test folder

```bash
cd packages/xchain-thorchain-amm/examples/xchainjs-test
```

2. This installs the dependencies

```bash
yarn
```

3. Run files

```bash
// estimate swap
ts-node estimateSwap.ts
// Doswap single
ts-node doSwap-Single.ts
// Doswap double
ts-node doSwap-Double.ts
```

4. Output
   Estimate swap

```bash
{
  input: '$ 1',
  totalFees: {
    inboundFee: 'ᚱ 0.01236623',
    swapFee: 'ᚱ 0.00000003',
    outboundFee: 'ᚱ 0.06',
    affiliateFee: 'ᚱ 0'
  },
  slipPercentage: '0.00000008243562073279',
  netOutput: 'ᚱ 0.29871914',
  waitTimeSeconds: '0',
  canSwap: true,
  errors: undefined
}
{
  input: '$ 1',
  totalFees: {
    inboundFee: '$ 0.03447329',
    swapFee: '$ 0.00000008',
    outboundFee: '$ 0.16726175',
    affiliateFee: '$ 0'
  },
  slipPercentage: '0.00000008243562073279',
  netOutput: 'ᚱ 0.29871914',
  waitTimeSeconds: '0',
  canSwap: true,
  errors: undefined
}

```

DoSwap-Single.ts testnet

```bash
{
  input: '$ 3',
  totalFees: {
    inboundFee: 'ᚱ 0.0123157',
    swapFee: 'ᚱ 0.00000027',
    outboundFee: 'ᚱ 0.06',
    affiliateFee: 'ᚱ 0'
  },
  slipPercentage: '0.00000024737744187697',
  netOutput: 'ᚱ 1.01699244',
  waitTimeSeconds: '0',
  canSwap: true,
  errors: undefined
}
Tx hash: 28C251AB9FFAE18EB62C98CFD2291DC0F42F686E6C802F85AF9513A1D4DA4715,
 Tx url: https://explorer.binance.org/tx/28C251AB9FFAE18EB62C98CFD2291DC0F42F686E6C802F85AF9513A1D4DA4715
 WaitTime: 12
```

DoSwap-Double.ts mainnet

```bash
{
  hash: '06e0b58257cfc6a5abfe4021afa7bf670ecffcd51e2666aa0408be365d7ab49e',
  url: 'https://blockchair.com/litecoin/transaction/06e0b58257cfc6a5abfe4021afa7bf670ecffcd51e2666aa0408be365d7ab49e',
  waitTimeSeconds: 156
}
```
