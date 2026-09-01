# `@xchainjs/xchain-near`

Custom client for communicating with the [NEAR Protocol](https://near.org/) blockchain using [`near-api-js`](https://github.com/near/near-api-js).

## Installation

```sh
yarn add @xchainjs/xchain-near
```

Peer / workspace dependencies:

```sh
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util
```

## Features (v0.1)

- Implicit account addresses from a BIP39 phrase (SLIP-0010 ed25519, path `m/44'/397'/{index}'`)
- Native NEAR balance, fees, transfer, prepare/broadcast
- Transaction history and hash lookup via NearBlocks
- JSON-RPC failover across public providers (FastNear, etc.)

**Not included yet:** Ledger signing, NEP-141 tokens, named-account creation.

## Address model

`getAddressAsync()` returns an **implicit account id** (64-char lowercase hex of the ed25519 public key). Recipients may be implicit or named (`alice.near`); `validateAddress` accepts both.

Sync `getAddress()` throws — use `getAddressAsync`.

Memos are not supported on native transfers and throw if provided.

## Usage

```typescript
import { Network } from '@xchainjs/xchain-client'
import { assetToBase, assetAmount } from '@xchainjs/xchain-util'
import { Client, defaultNearParams, NEARAsset } from '@xchainjs/xchain-near'

const client = new Client({
  ...defaultNearParams,
  network: Network.Mainnet,
  phrase: 'your twelve or twenty four word mnemonic …',
})

const address = await client.getAddressAsync()
const balances = await client.getBalance(address)

const txHash = await client.transfer({
  recipient: 'alice.near',
  amount: assetToBase(assetAmount(0.1, 24)),
  asset: NEARAsset,
})
```

## Network / RPC

Default public RPCs (override with `clientUrls`):

| Network | Defaults |
| ------- | -------- |
| Mainnet | `https://free.rpc.fastnear.com`, `https://near.drpc.org`, `https://1rpc.io/near` |
| Testnet | `https://test.rpc.fastnear.com`, `https://near-testnet.drpc.org` |

History uses NearBlocks (`nearblocksUrls` / optional `nearblocksApiKey`).

Public endpoints are rate-limited — production apps should use dedicated providers.

## Documentation

- [NEAR docs](https://docs.near.org/)
- [XChainJS docs](https://docs.xchainjs.org/)
