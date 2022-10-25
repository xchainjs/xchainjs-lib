## DO Thorchain Swap Example

## Environment

Make sure these are installed before running scripts

```bash
node --version v16.15.0
ts-node --version v10.7.0
```

tsconfig has already been set in the tsconfig.json

### Install

1. cd into examples/do-swap folder

```bash
cd examples/do-swap
yarn install
```

### Do Swap

executes a swap from one asset to another  
`yarn doSwap "MnemonicPhrase" stagenet|mainnet assestAmount decimals FromAssetString ToAssetString`

```bash
# example of swapping 10 RUNE to BCH
yarn doSwap "MnemonicPhrase" testnet 10 8 THOR.RUNE BCH.BCH

```
