# `@xchainjs/xchain-client`

Implements the following:

```javascript
interface BitcoinClient {
  generatePhrase(): string
  setPhrase(phrase?: string): void
  validatePhrase(phrase: string): boolean
  purgeClient(): void
  setNetwork(net: Network): void
  getNetwork(net: Network): Bitcoin.networks.Network
  setBaseUrl(endpoint: string): void
  getAddress(): string
  validateAddress(address: string): boolean
  scanUTXOs(): Promise<void>
  getBalance(): number
  getBalanceForAddress(address?: string): Promise<number>
  getTransactions(address: string): Promise<Txs>
  calcFees(memo?: string): Promise<object>
  vaultTx(addressVault: string, valueOut: number, memo: string, feeRate: number): Promise<string>
  normalTx(addressTo: string, valueOut: number, feeRate: number): Promise<string>
}
```

## Modules

- `client` - Custom client for communicating with Bitcoin using [BIP39](https://github.com/bitcoinjs/bip39) [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) and [WIF](https://github.com/bitcoinjs/wif)

## Installation

```
yarn add @xchainjs/xchain-client
```

Following dependencies will be installed into your project:

- bitcoinjs-lib
- bip39
- wif
- moment
- axios

## Service Providers

This package uses the following service providers:

| Function                    | Service     | Notes                                                                            |
| --------------------------- | ----------- | -------------------------------------------------------------------------------- |
| Balances                    | Sochain     | https://sochain.com/api#get-balance                                              |
| Transaction history         | Sochain     | https://sochain.com/api#get-display-data-address, https://sochain.com/api#get-tx |
| Transaction details by hash | Sochain     | https://sochain.com/api#get-tx                                                   |
| Transaction broadcast       | Sochain     | https://sochain.com/api#send-transaction                                         |
| Explorer                    | Blockstream | https://blockstream.info                                                         |

Rate limits: https://sochain.com/api#rate-limits (300 requests/minute)

## Testing

Uses a dotenv file to hold a `USER_PHRASE` and a `VAULT_PHRASE`

## Usage

Initialize client and use class methods:

```
import { Client, Network } from '../src/client'

const btcClient = new Client(Network.TEST)

const newPhrase = btcClient.generatePhrase()
```

### .generatePhrase()

Generate a 12 word BIP-39 seed phrase.

**Return**: `string`

### .setPhrase(`phrase`)

Loads a 12 word BIP-39 seed phrase to use as a BTC send/receive address.

**phrase**: 12 word BIP-39 seed phrase as `string`

**Return**: `void`

### .validatePhrase(`phrase`)

Validates if provided `phrase` is BIP-39.

**phrase**: 12 word BIP-39 seed phrase as `string`

**Return**: `boolean`

### .purgeClient()

Clears UTXOs and seed phrase from client class properties.

**Return**: `void`

### .setNetwork(`net`)

Set testnet or mainnet network using the `Network` interface.

**net**: `Network.TEST` or `Network.MAIN`

**Return**: `void` 

### .setBaseUrl(`endpoint`)

Set an electrs REST API endpoint to use for chain data.

**endpoint**: endpoint as `string`

**Return**: `void` 

### .getAddress()

Gets a P2WPKH address using the seed phrase set in `.setPhrase()` or initialization. If no phrase is set will error.

**Return**: `string` 

### .validateAddress(`address`)

Validates if provided `address` is p2wpkh and same network as the client.

**address**: `string`

**Return**: `boolean` 

### .scanUTXOs()

_Async_

Scans the UTXOs on the set seed phrase in `.setPhrase()` and stores them in class properties.

**Return**: `void` 

### .getBalance()

Get the balance of UTXOs from `.scanUTXOs()`

**Return**: `number` in sats

### .getBalanceForAddress(`address`)

_Async_ 

Get the balance of UTXOs for an external address

**address**: `string`

**Return**: `number` in sats 

### .getTransactions(`address`)

_Async_ 

Get transactions for an address

**address**: `string`

**Return**: `Array` of `objects` 

### .calcFees(`memo`)

_Async_ 

Calculates the fee rate and the fee total estimate for fast, regular, and slow transactions. Add a `memo` for a vault TX

**memo**: `string` _optional_

**Return**: `object` of `objects`

### .vaultTx(`addressVault`, `valueOut`, `memo`, `feeRate`)

_Async_ 

Generates a valid Vault TX hex to be broadcast

**addressVault**: `string`

**valueOut**: `number` in sats

**memo**: `string`

**feeRate**: `number`

### .normalTx(`addressTo`, `valueOut`, `feeRate`)

_Async_ 

Generates a valid Vault TX hex to be broadcast

**addressTo**: `string`

**valueOut**: `number` in sats

**feeRate**: `number`