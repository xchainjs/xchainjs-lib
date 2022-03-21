# XChainJS

XChainJS is a library with a common interface for multiple blockchains, built for simple and fast integration for wallets and more.

Join the conversation!
https://t.me/xchainjs

## Interface

The interface is [defined here.](https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-client/README.md)

### Common Interface

A single common interface:

1. Initialise with a valid BIP39 phrase and specified network (testnet/mainnet)
2. Get the address, with support for BIP44 path derivations (default is Index 0)
3. Get the balance (UTXO or account-based)
4. Get transaction history for that address
5. Make a simple transfer
6. Get blockchain fee information (standard, fast, fastest)

## Examples

### Generate a phrase, then save the encrypted keystore
```js
const fs = require('fs');
const crypto = require('@xchainjs/xchain-crypto')

const saveWallet = async () => {
    const phrase = crypto.generatePhrase()
    let password = 'Changeme!'
    const keystore = await crypto.encryptToKeyStore(phrase, password)
    fs.writeFileSync(`./keystore.json`, JSON.stringify(keystore, null, 4), 'utf8')
}
```

### Import a wallet, then log the address and balance
```js
const bnbClient = require('@xchainjs/xchain-binance');
const utils = require('@xchainjs/xchain-util')

const connectWallet = async () => {
    let BNBClient = new binanceClient.Client({network: Network.Mainnet, phrase:MY_PHRASE})
    let address = BNBClient.getAddress()
    console.log(`Asset Address is: ${address}`)

    let balances = await BNBClient.getBalance(address)
    try {
        let assetAmount = (utils.baseToAsset(balances[0].amount)).amount()
        console.log(`with balance: ${assetAmount}`)
    } catch (error) {
        console.log('no balance')
    }
}
```


### Make a BTC transfer
```js
const btcClient = require('@xchainjs/xchain-bitcoin')
const { AssetBTC } = require('@xchainjs/xchain-util')

let amountToTransfer = 0.0001
let recipient = 'bc1qlmdkft6vd88kpvhunze5pa8k74hahm4fklgnpj'
...
const transfer = async () => {
    let BTCClient = new btcClient.Client({network: Network.Mainnet, MY_PHRASE})
    let amount = utils.assetToBase(utils.assetAmount(amountToTransfer, 8))
    try {
        const result = await BTCClient.transfer({
            'asset': AssetBTC,
            'recipient': recipient,
            'amount': amount,
            'memo': "payment",
        })
        console.log(`${amount.amount().toString()} ${AssetObject.symbol} transfer made ${result}`)
    } catch (error) {
        console.log('deposit failed ', error)
    }
}
```

### Get transaction details of an address
```js
const { getDefaultClientUrl, Client } = require('@xchainjs/xchain-thorchain')
...
const txHistory = async () => {
    let settings = { clientUrl: getDefaultClientUrl(), network: Network.Mainnet, MY_PHRASE, chainIds: getChainIds }
    let THORClient = new Client(settings)
    let address = THORClient.getAddress()
    let txData = await THORClient.getTransactions({address:address})
    let lastTx = txData.txs[0]
    console.log(`${txData.total} transactions found, last is a ${lastTx.type} with txId ${lastTx.hash}`)
}
```

### Get share links
```js
const ltcClient = require('@xchainjs/xchain-litecoin')
...
const getLinks = async () => {
    let LTCClient = new ltcClient.Client({network: Network.Mainnet, phrase:process.env.PHRASE})
    let addressLink = LTCClient.getExplorerAddressUrl(LTCClient.getAddress())
    console.log(`LTC Address Link is: ${addressLink}`)
    let txLink = LTCClient.getExplorerTxUrl("hash")
    console.log(`LTC TX Link is: ${txLink}`)
}
```

### Get Fee Data
```js
const { AssetETH } = require('@xchainjs/xchain-util')
const ethClient = require('@xchainjs/xchain-ethereum');

const getFeeData = async () => {
    let ETHClient = new ethClient.Client({network: Network.Mainnet, phrase:process.env.PHRASE})
    let rates = await ETHClient.estimateGasPrices()
    let fastRateGWei = rates.fast.amount().toString()
    console.log(`The fast fee rate is ${fastRateGWei} GWEI`)

    let tx = {
        asset : AssetETH, 
        recipient : '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E',
        amount : utils.baseAmount(100000),
        memo : "tesh"
    }
    let fees = await ETHClient.getFees(tx)
    let assetAmount = (utils.baseToAsset(fees.fastest)).amount()
    console.log(`The fastest fee amount is ${assetAmount} ETH`)
}
```

### Importing

ESLINT
```js
import clientPkg from '@xchainjs/xchain-thorchain'
const { getDefaultClientUrl, Client, getChainIds } = clientPkg
import pkg from '@xchainjs/xchain-client';
const { Network } = pkg;
import * as utils from '@xchainjs/xchain-util'
import * as assetClient from '@xchainjs/xchain-binance'
```

NodeJS
```js
// put this in your package.json: "type": "module", 
const { getDefaultClientUrl, Client } = require('@xchainjs/xchain-thorchain')
const { Network } = require('@xchainjs/xchain-client')
const utils = require('@xchainjs/xchain-util')
const assetClient = require('@xchainjs/xchain-binance')
```

## Advanced Features

For wallets that need even more flexibility (smart contract blockchains) the client can be retrieved and the wallet is then free to handle directly.

## XChainJS uses following libraries, frameworks and more:

- [BitcoinJS](https://github.com/bitcoinjs/bitcoinjs-lib)
- [@binance-chain/javascript-sdk](https://github.com/binance-chain/javascript-sdk)
- [@ethersproject](https://github.com/ethers-io/ethers.js)
- [cosmos-client](https://github.com/cosmos-client/cosmos-client-ts)
- [PolkadotJS](https://github.com/polkadot-js)

![Test](https://github.com/thorchain/asgardex-electron/workflows/Test/badge.svg)

## Tests

### `unit`

```bash
yarn test
```

## Integration Tests

There are a suite of integration test which work against testnet. You will need to specify a phrase which controls testnet coins

```bash
export PHRASE="secret phrase here"
yarn e2e
```

### `unit`

## Development

`lerna bootstrap`

## Releasing

To test the publish via a dryrun:

```
NPM_USERNAME="test123" NPM_PASSWORD="test123" NPM_EMAIL="test123@test123.com" ./dryrun_publish.sh

```

To publish:

```
NPM_USERNAME="TODO Use real npm username" NPM_PASSWORD="TODO Use real npm password" NPM_EMAIL="TODO Use real npm email" ./publish.sh

```

## Contributing

Please see the Contributing Guidelines here (_coming soon_).

## Bug Reports

Please see the Bug Report Process here (_coming soon_).

## License

MIT [XChainJS](https://github.com/xchainjs)
