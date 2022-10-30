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
`yarn doSwap "MnemonicPhrase" stagenet|mainnet assestAmount decimals FromAssetString ToAssetString [affiliateAddress] [affiliate percent]`

```bash
# example of swapping 10 RUNE to BCH
yarn doSwap "MnemonicPhrase" mainnet 10 8 THOR.RUNE BCH.BCH

# example of swapping 10 RUNE to BCH with affiliate fee of 0.1% sent to address thor19pws7ukjew3vujdhfcr0eaqhffj2km7r6hf3cx
yarn doSwap "MnemonicPhrase" mainnet 10 8 THOR.RUNE BCH.BCH thor19pws7ukjew3vujdhfcr0eaqhffj2km7r6hf3cx 0.1

# example of swapping 10 RUNE to BCH with affiliate fee of 0.1% sent to thorname hello
yarn doSwap "MnemonicPhrase" mainnet 10 8 THOR.RUNE BCH.BCH hello 0.1
```

### Do Send

executes a transferof an asset from your wallet to another address  
`yarn doSend "MnemonicPhrase" stagenet|mainnet assestAmount decimals assetString destinationAddress`

```bash
# example of sending 1.5 LTC to another address
yarn doSend "MnemonicPhrase" mainnet 1.5 8 LTC.LTC MKWj2vwULucEGUWxbuG1SbpqEhvwba724e

# example of sending 10 RUNE to address thor19pws7ukjew3vujdhfcr0eaqhffj2km7r6hf3cx
yarn doSend "MnemonicPhrase" mainnet 10 8 THOR.RUNE  thor19pws7ukjew3vujdhfcr0eaqhffj2km7r6hf3cx

```
