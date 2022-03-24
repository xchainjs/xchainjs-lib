# `@xchainjs/xchain-bitcoin`

## Modules

- `client` - Custom client for communicating with Bitcoin using [BIP39](https://github.com/bitcoinjs/bip39) [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) and [WIF](https://github.com/bitcoinjs/wif)

## Installation

```
yarn add @xchainjs/xchain-bitcoin
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-bitcoin`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios bitcoinjs-lib wif
```

## Basic Usage Examples

## Generate new phrase, & save to encrypted keystore

Use xchain-crypto for generating and handling crypto related functions

```ts
//Imports
import fs = require('fs'); 
import { generatePhrase, validatePhrase, encryptToKeyStore } from "@xchainjs/xchain-crypto"

// Save the encrypted Keystore using phrase generated
const GenerateKeystore = async() => {
    const phrase = generatePhrase()
    const isCorrect = validatePhrase(phrase) //validate phrase if needed returns Boolean
    let password = process.env.PASSWORD
    const keystore = await encryptToKeyStore(phrase, password)  
    fs.writeFileSync(`./keystore.json`, JSON.stringify(keystore, null, 4), 'utf8')
    console.log(`Phrase valid?: ${isCorrect}`)
}

```

## Connect wallet to new Client and access class methods

Decrypt keystore returns `phrase` 
Create a new client instance
Use the client to getAddress() & getBalance() of address

```ts
//Imports
import { Client } from "@xchainjs/xchain-bitcoin"
import { Network } from "@xchainjs/xchain-client"
import { decryptFromKeystore} from "@xchainjs/xchain-crypto"

// Connect wallet to new btc client 
const connectWallet = async () => {
    let keystore = JSON.parse(fs.readFileSync('keystore.json', 'utf8'))
    let password = process.env.PASSWORD
    let phrase = await decryptFromKeystore(keystore, password)
    const btcClient = new Client({ network: Network.Mainnet, phrase})
    let address = btcClient.getAddress()     
    console.log(`Asset Address is: ${address}`)

    let balances = await btcClient.getBalance(address)
    try { 
        let assetAmount = (baseToAsset(balances[0].amount)).amount()
        console.log(`Asset address balance: ${assetAmount}`)
    } catch (error) {
        console.log('Address has no balance')
    }
}
```

## Transfer btc using btcClient
Default feeRate is `fast`
Import helper functions from `@xchainjs/xchain-util`
Decrypt keystore to retrieve phrase
Use utils to convert to BaseAmount for tx params
Build tx using parameters 
Client.transfer() > returns `Promise<string>` - The transaction hash 

```ts 
//Imports
import { assetToBase, baseToAsset, assetAmount, AssetBTC } from "@xchainjs/xchain-util"

let amountToTransfer = 0.0001
let recipient = 'Recipent_address'

const transfer = async () => {
    let keystore = JSON.parse(fs.readFileSync('keystore.json', 'utf8'))
    let password = process.env.PASSWORD
    let phrase = await decryptFromKeystore(keystore, password)
    let btcClient = new Client({network: Network.Mainnet, phrase })
    let amount = assetToBase(assetAmount(amountToTransfer, 8))
    try {
        const txid = await btcClient.transfer({
            'asset': AssetBTC,
            'recipient': recipient,
            'amount': amount,
            'memo': "payment"
        })
        console.log(`Amount: ${amount.amount().toString()} ${AssetBTC.symbol} Transaction id: ${txid}`)
    } catch (error){
        console.log(`Transfer failed ${error}`)
    }
}

```

## Transfer & set feeRate 

Build transaction using parameters
Set feeRate in transaction parameters
Or use getFeeRates()
```ts
//Returns FeeRates > this allows for dynamic feeRate adjustment on selection
const { fast, fastest, average } = await btcClient.getFeeRates()

try {
        const txid = await btcClient.transfer({
            'asset': AssetBTC,
            'recipient': recipient,
            'amount': amount,
            'memo': "test transfer",
            feeRate: fast
        })
        console.log(`Amount ${baseToAsset(amount).amount()} ${AssetBTC.symbol} Transaction id ${txid}`)
    } catch (error){
        console.log(`Transfer failed ${error}`)
    }
```

## Get Fees & FeeRates estimations

Client function getFees() returns object
`Fast: {"type":"BASE","decimal":8}`

```ts
//Get Fees - returns FeeOption & fee in BaseAmount 
` Fees Fast: 0.00001 Fastest: 0.0000468 Average: 0.00001 `
    try{
        const { fast, fastest, average } = await btcClient.getFees()
        console.log(`Fees Fast: ${baseToAsset(fast).amount()} Fastest: ${baseToAsset(fastest).amount()} Average: ${baseToAsset(average).amount()}`)

    }catch (error){
        console.log(error)
    }

//Get FeeRates - returns FeeOption & rate  
` Fast: 12, Fastest 60, Average: 6 `

    try{
        const { fast, fastest, average } = await btcClient.getFeeRates()
        console.log(`Fast: ${fast}, Fastest ${fastest}, Average: ${average}`)

    }catch (error){
        console.log(error)
    }

```

## Get transaction data
Create new btcClient instance
Call getTransaction(hash) returns JSON object
```ts
const transactionData = async () => {
    let phrase = await decryptFromKeystore(keystore, password)
    let btcClient = new Client({network: Network.Mainnet, phrase })
    let hash = "txhash string" 
    try{
        const txData = await btcClient.getTransactionData(hash)
        console.log(`From ${JSON.stringify(txData)}`)

    }catch (error) {
        console.log(`Error: ${error}`)
    }
}

```

## Get Transaction History
Search the client for transaction history 
Create new client instance
Call function with variable `address` 
Results can be filtered with extra parameters { offset, limit, startTime, asset?}

```ts
const transactionHistory = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    let btcClient = new Client({ network: Network.Mainnet, phrase })
    let Address = keystore1Address

    try {
        const txHistory = await btcClient.getTransactions({ address: Address, limit: 4 })
        console.log(`Found ${txHistory.total.toString()}`)
        txHistory.txs.forEach(tx => console.log(tx.hash))

    } catch (error) {
            console.log(`Error: ${error}`)
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
| Transaction broadcast       | Sochain     | https://sochain.com/api#send-transaction                                         |
| Explorer                    | Blockstream | https://blockstream.info                                                         |

Sochain API rate limits: https://sochain.com/api#rate-limits (300 requests/minute)

Bitgo API rate limits: https://app.bitgo.com/docs/#section/Rate-Limiting (10 requests/second)

### Extras

Compiler options if there are compilation errors

```js
tsconfig.json
{
    "compilerOptions": {
        "module":"commonjs",
        "target": "es5",
        "noEmitOnError": true,
        "lib": ["es6", "dom", "es2016", "es2017"]
    }
}
```



