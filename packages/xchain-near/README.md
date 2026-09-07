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

## Features (v0.3)

- Implicit account addresses from a BIP39 phrase (SLIP-0010 ed25519, path `m/44'/397'/{index}'`)
- Native NEAR balance, fees, transfer, prepare/broadcast
- NEP-141 fungible token balances and transfers (with NEP-145 `storage_deposit` when needed)
- Transaction history and hash lookup via NearBlocks
- JSON-RPC failover across public providers (FastNear, etc.)

**Not included yet:** Ledger signing, named-account creation, automatic FT discovery (pass `assets` to `getBalance`).

## Address model

`getAddressAsync()` returns an **implicit account id** (64-char lowercase hex of the ed25519 public key). Recipients may be implicit or named (`alice.near`); `validateAddress` accepts both.

Sync `getAddress()` throws — use `getAddressAsync`.

Memos are not supported on native transfers and throw if provided. NEP-141 transfers may pass `memo` through to `ft_transfer`.

## Usage

```typescript
import { Network } from '@xchainjs/xchain-client'
import { assetToBase, assetAmount, assetFromStringEx, TokenAsset } from '@xchainjs/xchain-util'
import { Client, defaultNearParams, NEARAsset } from '@xchainjs/xchain-near'

const client = new Client({
  ...defaultNearParams,
  network: Network.Mainnet,
  phrase: 'your twelve or twenty four word mnemonic …',
})

const address = await client.getAddressAsync()
const usdc = assetFromStringEx(
  'NEAR.USDC-17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
) as TokenAsset

// Native only when assets omitted; pass TokenAssets for NEP-141 balances.
const balances = await client.getBalance(address, [usdc])

const txHash = await client.transfer({
  recipient: 'alice.near',
  amount: assetToBase(assetAmount(0.1, 24)),
  asset: NEARAsset,
})

// NEP-141 transfer (auto storage_deposit if receiver is unregistered)
await client.transfer({
  recipient: 'bob.near',
  amount: assetToBase(assetAmount(1, 6)),
  asset: usdc,
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
