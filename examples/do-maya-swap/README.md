## Do MAYAChain Swap Example

## Environment

Make sure these are installed before running scripts

```bash
node --version
ts-node --version
```

tsconfig has already been set in the tsconfig.json

### Install

1. cd into examples/do-maya-swap folder

```bash
cd examples/do-maya-swap
```

### Do Swap

executes a swap from one asset to another 

```bash
yarn doSwap phrase stagenet|mainnet assetAmount decimals FromAssetString ToAssetString [affiliateAddress] [affiliateBps]
```

```bash
# example of swapping 0.5 RUNE to CACAO
yarn doSwap "your secret phrase" mainnet 0.5 8 THOR.RUNE MAYA.CACAO


# example of swapping 0.5 RUNE to CACAO with affiliate fee of 0.1% sent to MAYAName hello
yarn doSwap "your secret phrase" mainnet 0.5 8 THOR.RUNE MAYA.CACAO hello 10
```


