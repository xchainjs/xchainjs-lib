# MAYAChain AMM

MAYAChain AMM examples to show different use cases using the MAYAChain protocol

## Examples

### Swaps

#### Estimate swap

Check out how you should estimate a swap in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/mayachain-amm/estimate-swap.ts) or run it as

```sh
yarn estimateSwap amount fromAssetDecimals fromAsset toAsset [affiliateAddress] [affiliateBps]
```

#### Do swap

Check out how you should do a swap in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/mayachain-amm/do-swap.ts) or run it as

```sh
yarn doSwap phrase network amount fromAssetDecimals fromAsset toAsset [affiliateAddress] [affiliateBps]
```

#### Approve MAYAChain router to spend

Check out how you should approve the MAYAChain router to be able to swap ERC20 assets in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/mayachain-amm/approve-router.ts) or run it as

```sh
yarn approveRouter phrase network evmAsset evmAssetDecimals amount
```

### MAYANames

#### Get MAYAName details

Check out how you should get the MAYAName details in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/mayachain-amm/mayaname-details.ts) or run it as

```sh
yarn mayanameDetails MAYAName
```

#### Get MAYANames by owner

Check out how you should get the MAYANames owned by address in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/mayachain-amm/mayaname-owned.ts) or run it as

```sh
yarn mayanameOwned address
```