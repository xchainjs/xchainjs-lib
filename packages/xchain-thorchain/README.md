# `@xchainjs/xchain-thorchain`

Thorchain Module for XChainJS Clients

## Installation

```
yarn add @xchainjs/xchain-thorchain
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-thorchain`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util @xchainjs/xchain-cosmos axios @cosmos-client/core bech32-buffer
```

Important note: Make sure to install same version of `@cosmos-client/core` as `xchain-thorchain` is using (currently `@cosmos-client/core@0.45.1` ). In other case things might break.


## Basic usage examples

## Connect wallet to new Thor Client

Create new thorchain client
Client has two different sets of parameters `XchainClientParams & ThorchainClientParams`
ThorchainClient includes chainIds. getChainIds() return alls chain id's for default Client Url. 

```ts

// Imports 
import fs = require('fs')
import { Client, getChainIds, getDefaultClientUrl} from '@xchainjs/xchain-thorchain'
import { decryptFromKeystore } from "@xchainjs/xchain-crypto"
import { assetToBase, baseToAsset, assetAmount } from "@xchainjs/xchain-util"

// Create new instance of the client and query chain for balances. 
const connectWallet = async () => {
    const chainIds = await getChainIds(getDefaultClientUrl())
    let phrase = await decryptFromKeystore(keystore1, password)
    const thorClient = new Client({network: Network.Mainnet, phrase: phrase, chainIds})
    let address = thorClient.getAddress()
    console.log(`Address: ${address}`)
    try {
        const balance = await thorClient.getBalance(address)
        let assetAmount = (baseToAsset(balance[0].amount)).amount()
        console.log(`With balance: ${assetAmount}`)
    } catch (error) {
        console.log(`Caught ${error}`)
    }
}

```

## Transfer rune using Thor Client

Create new Thorchain client instance
Convert amount to transfer to base amount 
Build transaction. 

```ts

//Imports
import { assetToBase, baseToAsset, assetAmount } from "@xchainjs/xchain-util"

// Transaction parameters also include but not
const transferRune = async () => {
    const chainIds = await getChainIds(getDefaultClientUrl())
    let phrase = await decryptFromKeystore(keystore1, password)
    const thorClient = new Client({network: Network.Mainnet, phrase: phrase, chainIds})
    let amountToTransfer = 0.1
    let amount = assetToBase(assetAmount(amountToTransfer, DECIMAL ))
    let recipient = await getRecipientAddress()
    try {
        const txid = await thorClient.transfer({
            "amount": amount,
            "recipient": recipient,
            "memo": "test",
        })
        console.log(`Transaction sent: ${JSON.stringify(txid)}`)
    } catch (error) {
        console.log(`Caught ${error}`)
    }


```

## Get transaction Data & transaction History

Retrieve transaction data using transaction hash and address 
```ts

const transactionData = async () => {
    const chainIds = await getChainIds(getDefaultClientUrl())
    let phrase = await decryptFromKeystore(keystore1, password)
    const thorClient = new Client({network: Network.Mainnet, phrase: phrase, chainIds})
    let hash = "76523972494541DE97C6B9FD2409748C80763F95B24E9D512B2E6A8CB620F6A7"
    let address = thorClient.getAddress()
    try {
        const txData = await thorClient.getTransactionData(hash, address)
        console.log(`From ${JSON.stringify(txData)}`)
    } catch (error) {
        console.log(`Caught ${error}`)
    }
}
// By default getTransactions() returns the tranactions of current wallet
const transactionHistory = async () => {
    const chainIds = await getChainIds(getDefaultClientUrl())
    let phrase = await decryptFromKeystore(keystore1, password)
    const thorClient = new Client({network: Network.Mainnet, phrase: phrase, chainIds})
    
    try {
        const txHistory = await thorClient.getTransactions() 
        console.log(`Found ${txHistory.total.toString()}`)
        txHistory.txs.forEach(tx => console.log(tx.hash))
    } catch (error) {
        console.log(`Caught ${error}`)
    }
}
```

## Get transfer Fees

Thorchain runs on fee type of Flatfee set to `0.02` rune

```ts
// Returns Fees Fast: 0.02 Fastest: 0.02 Average: 0.02
const fee = async () => {
    const chainIds = await getChainIds(getDefaultClientUrl())
    let phrase = await decryptFromKeystore(keystore1, password)
    const thorClient = new Client({network: Network.Mainnet, phrase: phrase, chainIds})
    try {
        const {fast, fastest, average} = await thorClient.getFees()
        console.log(`Fees Fast: ${baseToAsset(fast).amount()} Fastest: ${baseToAsset(fastest).amount()} Average: ${baseToAsset(average).amount()}`)
    } catch (error) {
        console.log(`Caught ${error}`)
    }
}
```

## Get Network and Explorer Data

```ts
// Query thorchain client for network data and explorer data
 
const explorerUrl = async () => {
    const chainIds = await getChainIds(getDefaultClientUrl())
    let phrase = await decryptFromKeystore(keystore1, password)
    const thorClient = new Client({network: Network.Mainnet, phrase: phrase, chainIds})
    let hash = "insert hash"
    try {
        const networkData = thorClient.getExplorerUrl()
        console.log(`Explorer url: ${networkData}`)
        const transactionUrl = thorClient.getExplorerTxUrl(hash)
        console.log(`Explorer transaction: ${transactionUrl}`)

    } catch (error) {
        console.log(`Caught ${error}`)
    }
}

```

For more examples check out tests in `./__tests__/client.test.ts`

## Service Providers

This package uses the following service providers:

| Function                    | Service        | Notes                                                               |
| --------------------------- | -------------- | ------------------------------------------------------------------- |
| Balances                    | Cosmos RPC     | https://cosmos.network/rpc/v0.37.9 (`GET /bank/balances/{address}`) |
| Transaction history         | Tendermint RPC | https://docs.tendermint.com/master/rpc/#/Info/tx_search             |
| Transaction details by hash | Cosmos RPC     | https://cosmos.network/rpc/v0.37.9 (`GET /txs/{hash}`)              |
| Transaction broadcast       | Cosmos RPC     | https://cosmos.network/rpc/v0.37.9 (`POST /txs`)                    |
| Explorer                    | Thorchain.net  | https://thorchain.net                                               |

Rate limits: No

## Extras

## Creating protobuffer typescript bindings

In order for this library to de/serialize proto3 structures, you can use the following to create bindings

1. `git clone https://gitlab.com/thorchain/thornode`
2. run the following (adjust the paths acordingly) to generate a typecript file for MsgDeposit
   ```bash
   yarn run pbjs -w commonjs  -t static-module  <path to repo>/thornode/proto/thorchain/v1/x/thorchain/types/msg_deposit.proto <path to repo>/thornode/proto/thorchain/v1/common/common.proto <path to repo>/thornode/proto/thorchain/v1/x/thorchain/types/msg_send.proto <path to repo>/thornode/third_party/proto/cosmos/base/v1beta1/coin.proto -o src/types/proto/MsgCompiled.js
   ```
3. run the following to generate the .d.ts file
   ```bash
   yarn run pbts src/types/proto/MsgCompiled.js -o src/types/proto/MsgCompiled.d.ts
   ```

Alternatively, you can run the convenience script: `genMsgs.sh`, which will overwrite the proto/js files in types/proto. This should only be done and checked in if changes were made to the upstream Msg in the THORNode repo. 

