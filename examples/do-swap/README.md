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
yarn doSend "MnemonicPhrase" mainnet 10 8 THOR.RUNE thor19pws7ukjew3vujdhfcr0eaqhffj2km7r6hf3cx

# example of sending 10 RUNE to address thor19pws7ukjew3vujdhfcr0eaqhffj2km7r6hf3cx with memo
yarn doSend "MnemonicPhrase" mainnet 1 8 THOR.RUNE thorxxxx +:thor.rune:mayaxxxx

```

### Do streaming swap

executes a transfer of an asset from your wallet to another address minimizing slippage
`yarn doStreamingSwap "MnemonicPhrase" stagenet|mainnet assetsAmount decimals fromString toString streamingInterval streamingQuantity  [affiliateAddress] [affiliate percent]`

streamingInterval: The maximum interval for swaps that involve L1 assets (such as BTC, ETH) is restricted by the limitation of the maximum duration for a swap; currently, this limitation is 24 hours.

streamingQuantity: The minimum quantity is defined according to the following formula: https://dev.thorchain.org/thorchain-dev/concepts/streaming-swaps#calculate-optimal-swap.

```bash
# example of swapping 10 RUNE to ATOM minimizing slippage
yarn doStreamingSwap "MnemonicPhrase" mainnet 450 8 THOR.RUNE GAIA.ATOM 1 0

# example of swapping 74 ATOM to RUNE doing 2 mini-swaps with a separation of (5 block * 6s) = 30 second
yarn doStreamingSwap "MnemonicPhrase" mainnet 74 6 GAIA.ATOM THOR.RUNE 5 2
```
