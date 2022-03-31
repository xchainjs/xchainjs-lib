# `@xchainjs/xchain-ethereum`

## Modules

- `client` - Custom client for communicating with Ethereum by using [`ethers`](https://github.com/ethers-io/ethers.js)

## Installation

```
yarn add @xchainjs/xchain-ethereum
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-ethereum`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios ethers
```

## Basic usage examples

## Connect wallet to new Ethereum client and check address and balances

```ts
// Imports
import fs = require('fs');
import { Client } from "@xchainjs/xchain-ethereum"
import { Network } from "@xchainjs/xchain-client"
import { decryptFromKeystore } from "@xchainjs/xchain-crypto"

//Connect wallet, validate address and check balance 
const connectWallet = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const ethClient = new Client({network: Network.Mainnet, phrase})
    let address = ethClient.getAddress()
    let isValid = ethClient.validateAddress(address)
    console.log(address)
    if(isValid === true){
        try {
            const balance = await ethClient.getBalance(address)
            let assetAmount = (baseToAsset(balance[0].amount)).amount()
            console.log(`Adress: ${address} with balance ${assetAmount}`)
            
        } catch (error) {
            console.log(`Caught: ${error} `)
        }
    } else {
        console.log(`Address: ${address} is invalid`)
    }
}

```

## Transfer ethereum using ethereum client

Create new Ethereum Client instance
Convert amount to transfer to baseAmount. `ETH_DECIAL = 18`
Build Transaction.
Transfer function returns txid as an object promise

```ts
//Imports
import { assetToBase, baseToAsset, assetAmount } from "@xchainjs/xchain-util"

// Transfer ethereum other TxParams > feeOptionKey?, gasLimit?, gasPrice? 
const transferEth = async () => {
    let amountToTransfer = 0.001
    let recipient = await getRecipientAddress()
    let phrase = await decryptFromKeystore(keystore1, password)
    const ethClient = new Client({network: Network.Mainnet, phrase})
    let amount = assetToBase(assetAmount(amountToTransfer, ETH_DECIMAL))
    console.log("Building transaction")
    try {
        const txid = await ethClient.transfer({
            "amount": amount,
            "recipient": recipient,
            "walletIndex":0,
            "asset": AssetETH,
            "memo": "memo"
        })
        console.log(`Transaction sent: ${txid}`)
        return txid
    } catch (error) {
        console.log(`Caught: ${error} `)
    }
}

```

## Get transaction Data & transaction History 

Use functions to query ethereum explorer
getTransactionData()
getTransactions()

```ts
// Retrieve transaction data for a particular hash
const transactionData = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const ethClient = new Client({network: Network.Mainnet, phrase})
    let hash = "insert hash"
    try {
        const txData = await ethClient.getTransactionData(hash)
        console.log(`Transaction data ${JSON.stringify(txData)}`)
    } catch (error) {
        console.log(`Caught: ${error} `)
    }
}

// Retrieve transaction history for a particular address
const transactionHistory = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const ethClient = new Client({network: Network.Mainnet, phrase})
    let Address = ethClient.getAddress()
    try {
        const txHistory = await ethClient.getTransactions({address: Address})
        console.log(`Found ${txHistory.total.toString()}`)
        txHistory.txs.forEach(tx => console.log(tx.hash))
    } catch (error) {
        console.log(`Caught: ${error} `)
    }
}

```

## Get transfer Fees estimations

Retrieve estimated gas prices and gas limits from ethereum client
```ts
// Retrieve fee estimations from transaction parameters
const feeEstimations = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const ethClient = new Client({network: Network.Mainnet, phrase})
    let amountToTransfer = 0.001
    let amount = assetToBase(assetAmount(amountToTransfer, ETH_DECIMAL))
    let recipient = "insert address"
    try {
        const fees = await ethClient.estimateFeesWithGasPricesAndLimits({
            "amount": amount,
            "recipient": recipient
        })
        console.log(`Fees average : ${baseToAsset(fees.fees.average).amount()}, gas limits: ${fees.gasLimit}, gas prices average: ${baseToAsset(fees.gasPrices.average).amount()}`)
        
    } catch (error) {
        console.log(`Caught: ${error} `)
   

```

## Estimate Call & Approve

Create a new Eth Client instance
Call the function with correct parameters
```ts

// Call a contract function  
const estimateCall = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const ethClient = new Client({network: Network.Mainnet, phrase})
    let address = ethClient.getAddress()
    let contractAddress = "insert contract function"
    let abi = "insert abi"
    let funcName = "insert function name"
    try {
        const callEstimate = await ethClient.estimateCall({
            "abi": abi,
            "contractAddress": contractAddress,
            "funcName": funcName,
            "walletIndex": 0,
        })
        console.log(`Call estimate: ${JSON.stringify(callEstimate)}`) // Returns Big number
    } catch (error) {   
    }
}

// Check Allowance
const isApproved = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const ethClient = new Client({network: Network.Mainnet, phrase})
    let address = ethClient.getAddress()
    let contractAddress = "insert contract function"
    let amountToTransfer = 0.001
    let amount = assetToBase(assetAmount(amountToTransfer, ETH_DECIMAL)) 
    try {
        const isApproved = await ethClient({
            "contractAddress": contractAddress,
            "amount": amount,
            "spenderAddress": address,
        })
        console.log(`Allowed :${isApproved}`) // Boolean true / false
    } catch (error) {   
        console.log(`Caught: ${error}` )
    }
}

```

## Get Explorer Data

Use helper functions to retrieve explorer interface or explorer data on addresses or txid's

```ts

const explorerUrl = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    const ethClient = new Client({network: Network.Mainnet, phrase})
    let address = ethClient.getAddress()
    let hash = "0xa4707105d861fab959421203ef299d6ca5131067e58812062b2aa94494047f06"
    try {
        const etherscanInterface = ethClient.getEtherscanProvider() // returns the current etherjs etherscan interface
        console.log(etherscanInterface)
        const explorerAddressUrl = ethClient.getExplorerAddressUrl(address)
        console.log(`Etherscan url: ${explorerAddressUrl} for address: ${address} `)
        const explorerTxUrl = ethClient.getExplorerTxUrl(hash)
        console.log(`Explorer url: ${explorerTxUrl} for tx id:${hash}  `)
    } catch (error) {
        console.log(`Caught error: ${error}`)
    }
}

```


## Service Providers

This package uses the following service providers:

| Function                  | Service   | Notes                                                                          |
| ------------------------- | --------- | ------------------------------------------------------------------------------ |
| ETH balances              | Etherscan | https://etherscan.io/apis#accounts (module=`account`, action=`balance`)        |
| Token balances            | Etherscan | https://etherscan.io/apis#tokens (module=`account`, action=`tokenbalance`)     |
| ETH transaction history   | Etherscan | https://etherscan.io/apis#accounts (module=`account`, action=`txlistinternal`) |
| Token transaction history | Etherscan | https://etherscan.io/apis#accounts (module=`account`, action=`tokentx`)        |
| Transaction fees          | Etherscan | https://etherscan.io/apis#gastracker (module=`gastracker`, action=`gasoracle`) |
| Transaction broadcast     | Etherscan | https://sebs.github.io/etherscan-api/#eth_sendrawtransaction                   |
| Explorer                  | Etherscan | https://etherscan.io/                                                          |

Etherscan API rate limits: https://info.etherscan.com/api-return-errors/

- This package uses `etherjs` library, by default it uses several providers. (`https://docs.ethers.io/v5/api-keys/`)

## Extras