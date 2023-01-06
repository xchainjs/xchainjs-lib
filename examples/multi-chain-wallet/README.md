## Multi-chain-wallet Example

## Environment

Make sure these are installed before running scripts

```bash
node --version v16.15.0
ts-node --version v10.7.0
```

tsconfig has already been set in the tsconfig.json

### Install

1. cd into examples/multi-chain-wallet folder

```bash
cd examples/multi-chain-wallet
yarn install
```

### Multi-chain-wallet

executes a swap from one asset to another  
`yarn multi-chain-wallet "MnemonicPhraseSendingWallet" "MnemonicPhraseRecievingWallet"

```bash
# example of running the wallet with a sending and a receiving walelt
yarn multi-chain-wallet  "MnemonicPhraseSendingWallet" "MnemonicPhraseReceivingWallet"

```
