# `@xchainjs/xchain-bitcoincash`

## Modules

- `client` - Custom client for communicating with Bitcoin Cash by using [@psf/bitcoincashjs-lib](https://www.npmjs.com/package/@psf/bitcoincashjs-lib)

## Installation

```
yarn add @xchainjs/xchain-bitcoincash
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-bitcoincash`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios @psf/bitcoincashjs-lib bchaddrjs
```

## Basic Usage Example 

## Connect wallet to new Bitcoincash Client

```ts
// Imports
import { Client } from "@xchainjs/xchain-bitcoincash"
import { Network } from "@xchainjs/xchain-client"
import { decryptFromKeystore } from "@xchainjs/xchain-crypto"

// Connect wallet to new BitcoinCash Client & validate address
const connectWallet = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const bchClient = new Client({network: Network.Mainnet, phrase})
    let address = bchClient.getAddress()
    let isValid = bchClient.validateAddress(address)
    if( isValid === true ){
        try {
            const balance = await bchClient.getBalance(address)
            let assetAmount = (baseToAsset(balance[0].amount)).amount()
            console.log(`With balance: ${assetAmount}`)
    
        } catch (error) {
            console.log(`Caught: ${error}`)
        }
    } else {
        console.log(`Address ${address} is not valid`)
    }
}

```

## Transfer using BitcoinCash Client
Transaction parameters. Default fee rate is: 1 
Returns transaction hash string
```ts

//Imports 
import { assetToBase, assetAmount, AssetBCH } from "@xchainjs/xchain-util"

// Convert amount to transfer to BaseAmount using helper functions  
const transferBitcoinCash = async () => {
    let amountToTransfer = 0.01
    let recipient = await getRecipientAddress()
    let phrase = await decryptFromKeystore(keystore1, password)
    const bchClient = new Client({network: Network.Mainnet, phrase })
    let amount = assetToBase(assetAmount(amountToTransfer, BCH_DECIMAL))
    console.log("Building transaction")
    try {
        const txid = await bchClient.transfer({ 
            "asset": AssetBCH,
            "amount": amount,
            "recipient":recipient,
        })
        console.log(`Transaction sent: ${txid}`)
    } catch (error) {
        console.log(`Caught: ${error}`)
    } 
}

// Build transaction with feeRate adjustment
const feeRates = await bchClient.getFeeRates()
console.log(feeRates.average, feeRates.fast, feeRates.fastest)

try {
        const txid = await bchClient.transfer({ 
            "asset": AssetBCH,
            "amount": amount,
            "recipient":recipient,
            feeRate: feeRates.average // default is 1
        })
        console.log(`Transaction sent: ${txid}`)
    } catch (error) {
        console.log(`Caught: ${error}`)
    } 

```

## Get current fees & fee rates. 

getFees() returns fees in base amount i.e BCH `Fees Fast: 0.00000234 Fastest: 0.0000117 Average: 0.00000117`
getFeeRates() returns feeRates as `number`

```ts
// Query client for fees and fee rates
const returnFees = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const bchClient = new Client({network: Network.Mainnet, phrase })
    try {
        const {fast, fastest, average} = await bchClient.getFees()
        console.log(`Fees Fast: ${baseToAsset(fast).amount()} Fastest: ${baseToAsset(fastest).amount()} Average: ${baseToAsset(average).amount()}`)
        const feeRates = await bchClient.getFeeRates()
        console.log(feeRates.average, feeRates.fast, feeRates.fastest)
    } catch (error) {
        console.log(`Caught: ${error}`)
    }

```

## Get transaction Data & transaction History

```ts

// Returns transaction object for a particular txId
const transactionData = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const bchClient = new Client({network: Network.Mainnet, phrase })
    let hash = "insert hash"

    try {
        const txData = await bchClient.getTransactionData(hash)
        console.log(`From ${JSON.stringify(txData)}`)
    } catch (error) {
        console.log(`Caught: ${error}`)
    }
}

// Returns transaction history for a particular address
const transactionHistory = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const bchClient = new Client({network: Network.Mainnet, phrase })
    let Address = bchClient.getAddress()

    try {
        const txHistory = await bchClient.getTransactions({address: Address, limit: 4 })
        console.log(`Found ${txHistory.total.toString()}`)
        txHistory.txs.forEach(tx => console.log(tx.hash))
    } catch (error) {
        console.log(`Caught: ${error}`)
    }
}

```

## Service Providers

This package uses the following service providers:

| Function                    | Service           | Notes                                                               |
| --------------------------- | ----------------- | ------------------------------------------------------------------- |
| Balances                    | Haskoin           | https://api.haskoin.com/#/Address/getBalance                        |
| Transaction history         | Haskoin           | https://api.haskoin.com/#/Address/getAddressTxsFull                 |
| Transaction details by hash | Haskoin           | https://api.haskoin.com/#/Transaction/getTransaction                |
| Transaction fees            | Bitgo             | https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate          |
| Transaction broadcast       | Bitcoin Cash Node | https://developer.bitcoin.org/reference/rpc/sendrawtransaction.html |
| Explorer                    | Blockchain.com    | https://www.blockchain.com/explorer?view=bch                                          |

Haskoin API rate limits: No

Bitgo API rate limits: https://app.bitgo.com/docs/#section/Rate-Limiting (10 requests/second)


## Extras
