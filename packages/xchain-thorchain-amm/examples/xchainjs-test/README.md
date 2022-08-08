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

3. Run files // do

```bash
// estimate swap + 3 arguements => amount , fromAsset, toAsset
yarn estimate 2 BTC THOR

// Doswap Dingle + 5 arguements => seedPhrase, Network, amount, fromAsset, toAsset
// Note single swap is only between RUNE and Asset or vice versa. 
yarn doSingleSwap PHRASE testnet || mainnet 2 BTC RUNE

// Doswap Double + 5 arguements => seedPhrase, Network, amount, fromAsset, toAsset
yarn doDoubleSwap PHRASE mainnet || testnet 2 BTC BNB
```

4. Output
   Estimate swap

```bash
{
  input: '₿ 2',
  totalFees: {
    inboundFee: 'ᚱ 1.5972498',
    swapFee: 'ᚱ 2,385.63173976',
    outboundFee: 'ᚱ 0.06',
    affiliateFee: 'ᚱ 0'
  },
  slipPercentage: '0.01487671592851026829',
  netOutput: '157,974.51707296 THOR',
  waitTimeSeconds: '0',
  canSwap: true,
  errors: undefined
}
{
  input: '₿ 2',
  totalFees: {
    inboundFee: '⚡ 19,000',
    swapFee: '₿ 0.28378155',
    outboundFee: '⚡ 714',
    affiliateFee: '⚡ 0'
  },
  slipPercentage: '0.01487671592851026829',
  netOutput: '157,974.51707296 THOR',
  waitTimeSeconds: '0',
  canSwap: true,
  errors: undefined
}

```
