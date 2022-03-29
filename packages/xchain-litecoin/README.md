# `@xchainjs/xchain-client`

## Modules

- `client` - Custom client for communicating with Litecoin using [BIP39](https://github.com/bitcoinjs/bip39) [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) and [WIF](https://github.com/bitcoinjs/wif)

## Installation

```
yarn add @xchainjs/xchain-litecoin
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-litecoin`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios bitcoinjs-lib coininfo wif
```

## Basic usage examples

## Connect wallet to new Litecoin Client
Create new instance of Litecoin Client
Retrieve and validate address
Check balance of asset on address

```ts

//Imports 
import { Client } from "@xchainjs/xchain-litecoin"
import { Network } from "@xchainjs/xchain-client"
import { decryptFromKeystore } from "@xchainjs/xchain-crypto"

// Connect wallet and retrieve address and balance of assets on address
const connectWallet =async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const ltcClient = new Client({network: Network.Mainnet, phrase})
    let address = ltcClient.getAddress()
    console.log(address)
    let isValid = ltcClient.validateAddress(address)
    if( isValid === true ){
        try {
            const balance = await ltcClient.getBalance(address)
            let assetAmount = (baseToAsset(balance[0].amount)).amount()
            console.log(`With balance: ${assetAmount}`)
    
        } catch (error) {
            console.log(`Caught: ${error}`)
        }
    }
}

```

## Transfer litecoin using Litecoin Client instance

Default fee rate is 1 

```ts
//Imports
import { Client, LTC_DECIMAL } from "@xchainjs/xchain-litecoin"
import { assetToBase, baseToAsset, assetAmount } from "@xchainjs/xchain-util"

// Create new ltc Client and call transfer function
// Check what txParams are needed
const transferlitecoin = async () => {
    let amountToTransfer = 0.01
    let recipient = "insert recipient"
    let phrase = await decryptFromKeystore(keystore1, password)
    const ltcClient = new Client({network: Network.Mainnet, phrase})
    let amount = assetToBase(assetAmount(amountToTransfer, LTC_DECIMAL))
    console.log("Building transaction")
    try {
        const txid = await ltcClient.transfer({
            "amount": amount,
            "recipient": recipient,
            "memo": "memo"         
        })
        console.log(`Transaction sent: ${txid}`)
        const transactionUrl = await ltcClient.getExplorerTxUrl(txid) // returns url for tx
        console.log(`Transaction url: ${transactionUrl}`)
    } catch (error) {
        console.log(`Caught: ${error}`)
    }
}

```

## Get transfer fees and FeeRate estimations

getFees() returns Object with type <Fees> `Fees Fast: 0.00015678 Fastest: 0.0007839 Average: 0.00007839`
getFeeRates() > returns object `{ average: 100.5, fast: 201, fastest: 1005 }`

```ts
// Call getFee() and or getFeeRates() for fee estimations
const returnFees = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const ltcClient = new Client({network: Network.Mainnet, phrase})
    try {
        const {fast, fastest, average} = await ltcClient.getFees()
        console.log(`Fees Fast: ${baseToAsset(fast).amount()} Fastest: ${baseToAsset(fastest).amount()} Average: ${baseToAsset(average).amount()}`)
        const feeRates = await ltcClient.getFeeRates()
        console.log(feeRates)
    } catch (error) {
        console.log(`Caught: ${error}`)
    }
}

// FeeRates can be added to transfer txParams 
    try {
        const txid = await ltcClient.transfer({
            "amount": amount,
            "recipient": recipient,
            "memo": "memo test",
            feeRate: feeRates.fastest
        })
        console.log(`Transaction sent: ${txid}`)
    } catch (error) {
        console.log(`Caught: ${error}`)
    }
```
## Get transaction data & history

Create new ltc client instance and call functions to return transactionData
or transaction history 

```ts

// Return transanction data from a txid/hash
const transactionData = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const ltcClient = new Client({network: Network.Mainnet, phrase})
    let hash = "insert hash"
    try {
        const txData = await ltcClient.getTransactionData(hash)
        console.log(`From ${JSON.stringify(txData)}`)
    } catch (error) {
        console.log(`Caught: ${error}`)
    }
}
// Return transaction history
// txHistoryParams > address, offset?, startTime?, asset?, limit?
const transactionHistory = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const ltcClient = new Client({network: Network.Mainnet, phrase})
    let Address = ltcClient.getAddress()
    try {
        const txHistory = await ltcClient.getTransactions({address: Address, limit: 4})
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
| Transaction fees            | Bitgo       | https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate                       |
| Transaction broadcast       | Bitaps      | https://ltc.bitaps.com/broadcast                                                 |
| Explorer                    | Blockstream | https://litecoinblockexplorer.net/                                                        |

Sochain API rate limits: https://sochain.com/api#rate-limits (300 requests/minute)

Bitgo API rate limits: https://app.bitgo.com/docs/#section/Rate-Limiting (10 requests/second)

Bitaps API rate limits: Standard limit 15 requests within 5 seconds for a single IP address.

## Extras
