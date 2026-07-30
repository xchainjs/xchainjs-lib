# `@xchainjs/xchain-sui`

## Modules

- `client` - Custom client for communicating with the [Sui](https://sui.io/) blockchain using [@mysten/sui](https://github.com/MystenLabs/sui/tree/main/sdk/typescript)

## Installation

```
yarn add @xchainjs/xchain-sui
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-sui`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util
```

## Usage

Using the Sui client you can initialize the main class in consultation mode if you do not provide a phrase. That means you can retrieve information from the blockchain and prepare read operations, but you will not be able to sign transactions or derive owned addresses.

```typescript
import { Client } from '@xchainjs/xchain-sui'

const client = new Client()

// Make read operations with your client
```

To sign transactions and derive addresses, initialize with a mnemonic phrase:

```typescript
import { Client, defaultSuiParams, SUIAsset } from '@xchainjs/xchain-sui'
import { Network } from '@xchainjs/xchain-client'
import { assetToBase, assetAmount } from '@xchainjs/xchain-util'

const client = new Client({
  ...defaultSuiParams,
  network: Network.Mainnet,
  phrase: 'your mnemonic phrase',
})

const address = await client.getAddressAsync()
const balances = await client.getBalance(address)

const txHash = await client.transfer({
  asset: SUIAsset,
  recipient: '0x...',
  amount: assetToBase(assetAmount('1', 9)), // 1 SUI (9 decimals)
})
```

### Default parameters

```typescript
const defaultSuiParams = {
  network: Network.Mainnet,
  rootDerivationPaths: {
    [Network.Mainnet]: "m/44'/784'/",
    [Network.Testnet]: "m/44'/784'/",
    [Network.Stagenet]: "m/44'/784'/",
  },
  explorerProviders: {
    // Suiscan explorers for mainnet / testnet
  },
}
```

Default RPC endpoints:

| Network  | URL                                      |
| -------- | ---------------------------------------- |
| Mainnet  | `https://fullnode.mainnet.sui.io:443`    |
| Testnet  | `https://fullnode.testnet.sui.io:443`    |
| Stagenet | `https://fullnode.mainnet.sui.io:443`    |

You can override RPC URLs via `clientUrls` in the client params.

## Features

With the Sui client you can:

- Get native SUI and coin/token balances for an address
- Generate addresses from a secret phrase (SLIP-10, coin type `784`)
- Transfer SUI and coins/tokens to another address
- Get transaction details by digest
- Get address transaction history
- Estimate fees (gas-based model)

**Note:** Memos are not supported for SUI transfers.

## Explorer

| Network  | Explorer |
| -------- | -------- |
| Mainnet  | https://suiscan.xyz/mainnet |
| Testnet  | https://suiscan.xyz/testnet |
| Stagenet | https://suiscan.xyz/mainnet (uses Mainnet explorer) |

## Documentation

More information about XChainJS clients can be found on [documentation](https://xchainjs.gitbook.io/xchainjs)
