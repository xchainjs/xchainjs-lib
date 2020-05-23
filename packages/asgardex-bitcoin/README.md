# `@thorchain/asgardex-bitcoin`

Implements the following:

```javascript
export interface BitcoinClient {
  setNetwork(net: Network): void
  getNetwork(net: Network): Bitcoin.networks.Network
  generatePhrase(): string
  setPhrase(phrase?: string): void
  validatePhrase(phrase: string): boolean
  getAddress(): string
  validateAddress(address: string): boolean
  scanUTXOs(address: string): Promise<void>
  getBalance(): number
  getChange(valueOut: number): number
  vaultTx(addressVault: string, valueOut: number, memo: string, feeRate: number): Promise<string>
  normalTx(addressTo: string, valueOut: number, feeRate: number): Promise<string>
}
```

## Modules

- `client` - Custom client for communicating with Bitcoin using [BIP39](https://github.com/bitcoinjs/bip39) [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) and [WIF](https://github.com/bitcoinjs/wif)

## Installation

```
yarn add @thorchain/asgardex-bitcoin
```

Following dependencies will be installed into your project:

- bitcoinjs-lib
- bip39
- wif

```
yarn
```

## Testings

Uses a dotenv file to hold a `USER_PHRASE` and a `VAULT_PHRASE`
