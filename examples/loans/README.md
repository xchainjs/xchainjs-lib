## Thorchain quote Loans Open and close examples

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
cd examples/loans
```

Currently its not available, will update results when its on mainnet.

### Quote Loan Open

`yarn loanQuoteOpen network amount decimals Asset TargetAsset TargetAddress`

```bash
# example of calling the loan quote open function
yarn loanQuoteOpen mainnet 1 8 BTC.BTC ETH.ETH 0xf155e9cdD77A5d77073aB43d17F661507C08E23d

{
  inboundAddress: '',
  expectedWaitTime: { outboundDelayBlocks: undefined, outbondDelaySeconds: undefined },
  fees: {
    asset: '',
    liquidity: undefined,
    outbound: undefined,
    total_bps: undefined
  },
  slippageBps: undefined,
  router: undefined,
  expiry: 0,
  warning: '',
  notes: '',
  dustThreshold: undefined,
  recommendedMinAmountIn: undefined,
  memo: undefined,
  expectedAmountOut: '',
  expectedCollateralizationRatio: '',
  expectedCollateralUp: '',
  expectedDebtUp: '',
  errors: [
    'Thornode request quote failed: failed to simulate loan: loans are currently paused'
  ]
}
```

### Quote Loan Closed

`yarn loanQuoteClosed network LoanedAsset amount decimals InitialAsset fromAddress`

```bash
# example of calling the loan quote closed function
yarn loanQuoteClosed mainnet ETH.ETH 1 8 BTC.BTC bc1q3q6gfcg2n4c7hdzjsvpq5rp9rfv5t59t5myz5v

$ npx ts-node loanQuoteClosed.ts mainnet ETH.ETH 1 8 BTC.BTC bc1q3q6gfcg2n4c7hdzjsvpq5rp9rfv5t59t5myz5v
{
  inboundAddress: '',
  expectedWaitTime: { outboundDelayBlocks: undefined, outbondDelaySeconds: undefined },
  fees: {
    asset: '',
    liquidity: undefined,
    outbound: undefined,
    total_bps: undefined
  },
  slippageBps: undefined,
  router: undefined,
  expiry: 0,
  warning: '',
  notes: '',
  dustThreshold: undefined,
  recommendedMinAmountIn: undefined,
  memo: undefined,
  expectedAmountOut: '',
  expectedCollateralDown: '',
  expectedDebtDown: '',
  errors: [
    'Thornode request quote failed: failed to simulate loan: loans are currently paused'
  ]
}
✨  Done in 3.89s
```
