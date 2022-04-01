# `@xchainjs/xchain-terra`

Terra Module for XChainJS Clients

## Modules
Terra.js a JavaScript SDK for writing applications that interact with the Terra blockchain `@terra-money/terra.js`, [https://www.npmjs.com/package/@terra-money/terra.js]
Exposes the Terra API through [`LCDClient`](https://docs.terra.money/docs/develop/sdks/terra-js/query-data.html)

## Installation

```
yarn add @xchainjs/xchain-terra
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-terra`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios @terra-money/terra.js
```

## Terra Client Testing

```
yarn install
yarn test

```

## Basic Usage Example 

## Connect wallet to new Terra Client

Decrypt keystore returns `phrase` 
Create a new Terra client instance
Use the TerraClient to getAddress() & getBalance() of address

```ts
// Imports 
import { Network } from "@xchainjs/xchain-client"
import { decryptFromKeystore } from "@xchainjs/xchain-crypto"
import { assetToBase, baseToAsset, assetAmount } from "@xchainjs/xchain-util"

// Connect wallet to new Terra client instance & check balances of assets 
const connectWallet = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const terraClient = new Client({network: Network.Mainnet, phrase})
    let address = terraClient.getAddress()
    console.log(address)
    try {
        const balances = await terraClient.getBalance(address)
        console.log(`Asset ${balances.forEach(asset => console.log(`${asset.asset.symbol}, ${(baseToAsset(asset.amount).amount())}`))}`)
    } catch (error) {
        console.log("Caught: " + error.message)
    }
}

```

## Transfer Luna using Terra Client

Create new instance of TerraClient
Set correct amount using `xchain-util` helper functions
Build new transaction using TxParams and call transfer.

```ts
const transferTerra = async () => {
    let recipient = await getRecipientAddress() 
    let amountToTransfer = 0.01
    let amount = assetToBase(assetAmount(amountToTransfer, TERRA_DECIMAL))
    let phrase = await decryptFromKeystore(keystore1, password)
    const terraClient = new Client({network: Network.Mainnet, phrase})
    console.log("Building Transaction")
    try {
        const txid = await terraClient.transfer({
            "walletIndex": 0,
            "asset": AssetLUNA,
            "amount": amount,
            "recipient": recipient,
            "memo": ""
        })
        console.log(`Amount: ${amount.amount()} Asset: ${AssetLUNA.symbol} TransactionId: ${txid} `)
        
    } catch (error) {
        console.log(`Transfer failed:  ${error}`)
    }
}

```

## Get transaction Data & transaction History 

```ts
// Return trasanction data from a txid/hash
const transactionData = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const terraClient = new Client({network: Network.Mainnet, phrase })
    let hash = "insert hash"
    try {
        const txData = await terraClient.getTransactionData(hash)
        console.log(JSON.stringify(txData))
        console.log(`From ${JSON.stringify(txData.from[0]["from"])}`)
        console.log(`To ${JSON.stringify(txData.to[0]["to"])}`)

    } catch (error) {
        console.log(`Caught: ${error}`)
    }
}

// Return transaction history
// txHistoryParams > address, offset?, startTime?, asset?, limit? 
const transactionHistory = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const terraClient = new Client({network: Network.Mainnet, phrase })
    let Address = terraClient.getAddress()
    try {
        const txHistory = await terraClient.getTransactions({address: Address})
        console.log(`Found ${txHistory.total.toString()}`)
        txHistory.txs.forEach(tx => console.log(JSON.stringify(tx.to)))
    } catch (error) {
        console.log(`Caught: ${error}`)
    }
}

```

## Get transfer Fees

Returns current fees for transaction options on the network.
Returns fee in BaseLunaAmount

```ts

const getTransferFees = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const terraClient = new Client({network: Network.Mainnet, phrase })
    try {
        const {fast, fastest, average} = await terraClient.getFees()
        console.log(`Fees Fast: ${baseToAsset(average).amount()}`)
        console.log(`Fees Fast: ${baseToAsset(fast).amount()}`)
        console.log(`Fees Fast: ${baseToAsset(fastest).amount()}`)
    } catch (error) {
        console.log(`caught: ${error}`)
    }
}

```

## Get Network and Explorer Data 

Using in-built functions to return useful links and data

```ts
const networkData = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const terraClient = new Client({network: Network.Mainnet, phrase })
    let txid = "insert hash"
    let address = terraClient.getAddress()
    console.log(address)
    try {
        const getNetwork = terraClient.getNetwork()
        const getExplorerAddressUrl = terraClient.getExplorerAddressUrl(address)
        const getExplorerTxUrl = terraClient.getExplorerTxUrl(txid)
        const getExplorerUrl = terraClient.getExplorerUrl()
        console.log(`Network: ${getNetwork}`)
        console.log(`Explorer Address url: ${getExplorerAddressUrl}`)
        console.log(`Explorer txid url: ${getExplorerTxUrl}`)
        console.log(`Explorer Url: ${getExplorerUrl}`)
    } catch (error) {
        console.log(`caught: ${error}`)
    }
}

```

## Service Providers

This package uses the following service providers:

| Function                    | Service              | Notes                                                                         | Rate limits                   |
| --------------------------- | -------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| Explorer                    | Terra Luna           | https://finder.terra.money/mainnet                                            |                               |


## Extras

Tested with node v 16.4.0 