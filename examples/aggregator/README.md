# Aggregator

Aggregator examples to show different use cases

## Examples

### Swaps

#### Estimate swap

Check out how you should estimate a swap in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/aggregator/swap-do.ts) or run it as

```sh
yarn estimateSwap fromAsset toAsset amount decimals
```

#### Do swap

Check out how you should do a swap between BTC and ETH in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/aggregator/swap-estimate.ts) or run it as


```sh
yarn doSwap phrase amount
```

#### Get swap history

Check out how you should get the swap history of several addresses in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/aggregator/swap-history.ts) or run it as

```sh
yarn swapHistory chain1:address1 chain2:address2
```
