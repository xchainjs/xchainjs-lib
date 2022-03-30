# `@xchainjs/xchain-doge`

## Modules

- `client` - Custom client for communicating with Doge using [BIP39](https://github.com/bitcoinjs/bip39) [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) and [WIF](https://github.com/bitcoinjs/wif)

## Installation

```
yarn add @xchainjs/xchain-doge
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-doge`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios bitcoinjs-lib coininfo wif
```

## Basic Usage Examples

## Connect wallet to new Doge client and check balance

Create new instance of Dogecoin Client
Retrieve and validate address
Check balance of asset on address

```ts
//Imports 
import { Client, DOGE_DECIMAL} from "@xchainjs/xchain-doge"
import { Network } from "@xchainjs/xchain-client"
import { decryptFromKeystore } from "@xchainjs/xchain-crypto"

// Connect wallet to new Client 
const connectWallet = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    let dogeClient = new Client({ network: Network.Mainnet, phrase})
    let address = dogeClient.getAddress()
    let isValid = dogeClient.validateAddress(address)
    if(isValid === true){
        try {
            const balance = await dogeClient.getBalance(address)
            let assetAmount = (baseToAsset(balance[0].amount)).amount()
            console.log(`Adress: ${address} with balance ${assetAmount}`)
        } catch (error) {
            console.log(`Caught: ${error}`)
        }
    } else {
        console.log(`Address ${address} is not valid`)
    }
}

```

## Transfer dogecoin using dogeClient instance

Create new client instance 
Convert amount to transfer to base
Build transaction with correct Tx Parameters
Default fee is set to 1

```ts
//Imports
import { assetToBase, baseToAsset, assetAmount, AssetBTC } from "@xchainjs/xchain-util"

// Call Transfer with TxParams
const transferDoge = async () => {
    let amountToTransfer = 0.01
    let recipient = await getRecipientAddress()
    let phrase = await decryptFromKeystore(keystore1, password)
    let dogeClient = new Client({ network: Network.Mainnet, phrase})
    let amount = assetToBase(assetAmount(amountToTransfer, DOGE_DECIMAL))
    console.log("Building transaction", JSON.stringify(amount.amount()))
    try {
        const txid = await dogeClient.transfer({
            "amount": amount,
            "recipient": recipient,
            "memo": "test"
        })
        console.log(`Transaction sent: ${txid}`)

    } catch (error) {
         console.log(`Caught: ${error}`)
    }
// Transfer with fee rate set 
    let feeRate = await dogeClient.getFeeRates()
    try {
        const txid = await dogeClient.transfer({
            "amount": amount,
            "recipient": recipient,
            "memo": "test",
            feeRate: feeRate.fastest
        })
        console.log(`Transaction sent: ${txid}`)

    } catch (error) {
         console.log(`Caught: ${error}`)
    }
```

## Get transfer fees and FeeRate estimations

Create new dogeClient and query getFees & getFeeRates functions
Fees are returned as base Amount. 

```ts
// Get fees 
const feeData = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    let dogeClient = new Client({ network: Network.Mainnet, phrase})
    try {
        const {fast, fastest, average} = await dogeClient.getFees()
        console.log(`Fees Fast: ${baseToAsset(fast).amount()} Fastest: ${baseToAsset(fastest).amount()} Average: ${baseToAsset(average).amount()}`)

    } catch (error) {
         console.log(`Caught: ${error}`)
    }   
}
// Get Fee Rates
const feeRates = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    let dogeClient = new Client({ network: Network.Mainnet, phrase})
    try {
        const feeRates = await dogeClient.getFeeRates() // returned as number
        console.log(feeRates.average, feeRates.fast, feeRates.fastest)
    } catch (error) {
         console.log(`Caught: ${error}`)
    }   
}

// Get both Fees and Rates
const getFeesWithRates = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    let dogeClient = new Client({ network: Network.Mainnet, phrase})
    try {
        const feesWithRates = await dogeClient.getFeesWithRates()
        console.log(feesWithRates.fees, feesWithRates.rates)
    } catch (error) {
         console.log(`Caught: ${error}`)
    }  
}

```

## Get transaction data & history

Create new client instance and query chain data with hash
getTransactions() can be filtered with `limit? offset? startTime?`

```ts

// Retrieve transaction data for a transaction hash 

const transactionData = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    let dogeClient = new Client({ network: Network.Mainnet, phrase})
    let hash = "insert hash"
    try {
        const txData = await dogeClient.getTransactionData(hash)
        console.log(`From ${JSON.stringify(txData)}`)   
    } catch (error) {
        console.log(`Caught: ${error}`)
    }
}

// Retrieve transaction history for a particular address

const transactionHistory = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    let dogeClient = new Client({ network: Network.Mainnet, phrase})
    let Address = dogeClient.getAddress()
    try {
        const txHistory = await dogeClient.getTransactions({address: Address}) 
        console.log(`Found ${txHistory.total.toString()}`)
        txHistory.txs.forEach(tx => console.log(tx.hash))
    } catch (error) {
         console.log(`Caught: ${error}`)
    }    
}

```

## Service Providers

This package uses the following service providers:

| Function                    | Service     | Notes                                                                            |
| --------------------------- | ----------- | -------------------------------------------------------------------------------- |
| Balances                    | Sochain     | https://sochain.com/api#get-balance                                              |
| Transaction history         | Sochain     | https://sochain.com/api#get-display-data-address, https://sochain.com/api#get-tx |
| Transaction details by hash | Sochain     | https://sochain.com/api#get-tx                                                   |
| Transaction fees            | BlockCypher | https://api.blockcypher.com/v1/doge/main                                         |
| Transaction broadcast       | BlockCypher | https://api.blockcypher.com/v1/doge/main/txs/push                                |
| Explorer                    | Blockchair  | https://blockchair.com/dogecoin                                                  |

Sochain API rate limits: https://sochain.com/api#rate-limits (300 requests/minute)

BlockCypher API rate limits: https://api.blockcypher.com/v1/doge/main (5 requests/second)

## Extras