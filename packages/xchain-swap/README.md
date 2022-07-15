# `@xchainjs/xchain-swap`

## Modules

Swap module for XChainJS Clients

## Installation

```
yarn add @xchainjs/xchain-swap
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-swap`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util @xchainjs/xchain-cosmos axios @cosmos-client/core bech32-buffer
```

## Usage

```typescript
const midgard = new Midgard()       //defaults to mainnet
const thorchain  = new ThorchainAMM(midgard)
const swapParams = {
    sourceAsset: AssetBTC,
    destinationAsset: AssetRune,
    inputAmount: baseAmount(10000000),
    affiliateFeePercent:0.03,        //optional
    slipLimit: new BigNumber(0.02)}//optional
console.log(await thorchain.estimateSwap(swapParams))
```


## Open Items

- [x] Merge THORNode into Master
- [x] Update THORNode.ts 
- [ ] Complete and Test CheckTx  *(Stomzy)*
- [ ] Move CheckTx to THORChainAMM  *(Stomzy)*
- [ ] Test for Synth *(In-progess, Stormzy)*
- [ ] Test ERC20 Support *(In-progess, Stormzy)*  
- [ ] Review to remove from THORChainAMM.ts
    - [ ] THORChainAMM.convertAssetToAsset()
    - [ ] THORChainAMM.getChainAsset()
    - [x] THORChainAMM.calcInboundFee()
- [ ] code clean-up
  - [ ] rename files to NOT CamelCase
  - [ ] walk through all functions
  - [ ] find/resolve TODOS
  - [ ] document functions  
  - [ ] update README  
- [ ] Update Aggregator Documentation (Chris)
- [ ] Complete Add Liquidity
- [ ] Thornode update dependency
