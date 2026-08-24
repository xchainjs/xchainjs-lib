<div align="center">
  <h1 align="center">Aggregator</h1>

  <p align="center">
    <a href='https://www.npmjs.com/package/@xchainjs/xchain-aggregator' target='_blank'>
      <img alt="NPM Version" src="https://img.shields.io/npm/v/%40xchainjs%2Fxchain-aggregator" />
    </a>
      <a href='https://www.npmjs.com/package/@xchainjs/xchain-aggregator' target='_blank'>
      <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40xchainjs%2Fxchain-aggregator" />
    </a>
  </p>
</div>

<br />

The Aggregator package has been developed to facilitate interaction with multiple decentralised protocols. It provides a unified interface for developers, with the objective of offering end users the best of each protocol in the most straightforward manner.

## Supported protocols

The current supported protocols are:

- [Thorchain](https://thorchain.org/)
- [Maya Protocol](https://www.mayaprotocol.com/)
- [Chainflip](https://chainflip.io/)


## Installation

```sh
yarn add @xchainjs/xchain-aggregator
```

or 

```sh
npm install @xchainjs/xchain-aggregator
```

## Initialization

Aggregator can be easily initialise providing the [Wallet](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-wallet) with the XChainJs Clients you are working with. If no protocol is provided, the Aggregator will work with all the supported protocols.

```ts
import { Aggregator } from '@xchainjs/xchain-aggregator';

const aggregator = new Aggregator({
  wallet: new Wallet({
    // Your XChainJS clients
  }),
  protocols: [
    // The protocols you want to work with
  ],
  affiliate: {
    // Affiliate config
  }
})
```

## Features

### Swaps

- Estimate the most efficient swap among protocols
- Do swaps
- Get swap history through different protocols

### Chainflip deposit channels

Chainflip `estimateSwap` is **quote-only** — it does **not** open a deposit channel. Wallets that refresh quotes must not call channel creation on every refresh (channels expire; late deposits may not swap or refund).

Recommended flow:

1. `aggregator.estimateSwap(...)` — price discovery / refresh (`toAddress` empty for Chainflip; `canSwap` means a usable quote exists)
2. At confirm, immediately before broadcast: `aggregator.requestChainflipDepositAddress(...)` — returns `depositAddress`, `depositChannelId`, and `expiresAt`
3. Transfer to that deposit address (or use `doSwap`, which opens a channel then sends)

Do not cache deposit addresses across `expiresAt`. EVM Chainflip deposit addresses can be reused across channels; always bind signing to a live `depositChannelId` + expiry.

**Important:** Chainflip must **observe** the deposit before channel expiry. Broadcasting before `expiresAt` is not enough if the source chain (especially EVM) confirms after expiry — funds may not create a swap and may not FoK-refund. Prefer `requestChainflipDepositAddress` over `doSwap` when you need to track `expiresAt` / `depositChannelId` around slow Ledger signing or post-broadcast monitoring (`doSwap` does not return channel metadata).


## Examples

You can find examples using the Aggregator package in the [aggregator](https://github.com/xchainjs/xchainjs-lib/tree/master/examples/aggregator) examples folder.


## Documentation

More information about how to use the Aggregator package can be found on [documentation](https://xchainjs.gitbook.io/xchainjs/aggregator)