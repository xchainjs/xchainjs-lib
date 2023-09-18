<p align="center">
  <a href="https://xchainjs.org/" target="_blank" rel="noopener noreferrer"><img width="400" height="300" src="https://github.com/xchainjs/xchainjs-org.github.io/blob/master/assets/img/logo.png" alt="xchainjs logo"></a>
</p>
<h1 align="center">
    XChainJS - xchainjs Library 
</h1>

_:star: Developed / Developing by [xchainjs](https://xchainjs.org/)_

XChainJS is a library with a common interface for multiple blockchains, built for simple and fast integration for wallets and more.

## License

[![License](https://img.shields.io/badge/MIT-xchainjs-green)]()

Telegram group: https://t.me/xchainjs \
Homepage: https://xchainjs.org \
Live Examples: https://dev.thorchain.org/thorchain-dev/xchainjs-integration-guide/query-package \
Docs: http://docs.xchainjs.org/overview \
Integration guide: https://dev.thorchain.org/thorchain-dev/xchainjs-integration-guide/overview

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

### Packages - Thorchain

- [`xchain-avax`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-avax)
- [`xchain-binance`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-binance)
- [`xchain-bitcoin`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-bitcoin)
- [`xchain-bitcoincash`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-bitcoincash)
- [`xchain-bsc`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-bsc)
- [`xchain-client`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-client)
- [`xchain-cosmos`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-cosmos)
- [`xchain-crypto`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-crypto)
- [`xchain-doge`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-doge)
- [`xchain-ethereum`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-ethereum)
- [`xchain-evm`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-evm)
- [`xchain-litecoin`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-litecoin)
- [`xchain-midgard`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-midgard)
- [`xchain-thorchain`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-thorchain)
- [`xchain-thorchain-amm`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-thorchain-amm)
- [`xchain-thorchain-query`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-thorchain-query)
- [`xchain-thornode`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-thornode)
- [`xchain-util`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-util)
- [`xchain-utxo-providers`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-utxo-providers)

### Packages - Mayachain

- [`xchain-mayanode`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-mayanode)
- [`xchain-mayachain`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-mayachain)
- [`xchain-dash`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-dash)

### Working Examples

- [`doSwap(), doSend()`](https://github.com/xchainjs/xchainjs-lib/tree/master/examples/do-swap)
- [`addLiquidity()`](https://github.com/xchainjs/xchainjs-lib/tree/master/examples/liquidity)
- [`estimateSwap()`](https://github.com/xchainjs/xchainjs-lib/tree/master/examples/estimate-swap)
- [`checkTx()`](https://github.com/xchainjs/xchainjs-lib/tree/master/examples/check-tx)
- [`loans()`](https://github.com/xchainjs/xchainjs-lib/tree/master/examples/loans)

### Tools / TxJammer

- [`Tx Jammer`](https://github.com/xchainjs/xchainjs-lib/tree/master/tools/txJammer)

## Advanced Features

For wallets that need even more flexibility (smart contract blockchains) the client can be retrieved and the wallet is then free to handle directly.

## XChainJS uses following libraries, frameworks and more:

- [BitcoinJS](https://github.com/bitcoinjs/bitcoinjs-lib)
- [@binance-chain/javascript-sdk](https://github.com/binance-chain/javascript-sdk)
- [@ethersproject](https://github.com/ethers-io/ethers.js)
- [cosmos-client](https://github.com/cosmos-client/cosmos-client-ts)

![Test](https://github.com/thorchain/asgardex-electron/workflows/Test/badge.svg)

## Tests

Make sure Jest and Lerna is installed

```
yarn add --dev jest lerna
```

Start with

```
yarn
yarn build
```

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

Please ask in the telegram group to be added as a contributor.

## Bug Reports

Please submit an issue and flag in the telegram group.
