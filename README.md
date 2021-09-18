# XChainJS

XChainJS is a library with a common interface for multiple blockchains, built for simple and fast integration for wallets and more.

Join the conversation!
https://t.me/xchainjs

# Interface

The interface is [defined here.](https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-client/README.md)

### Common Interface

The interface supports as a minimum the following functions for each blockchain:

1. Initialise with a valid BIP39 phrase and specified network (testnet/mainnet)
2. Get the address, with support for BIP44 path derivations (default is Index 0)
3. Get the balance (UTXO or account-based)
4. Get transaction history for that address
5. Make a simple transfer
6. Get blockchain fee information (standard, fast, fastest)

### Extended Interface

Some blockchains have different functions. More advanced logic can be built by extending the interface, such as for Binance Chain and Cosmos chains.

### Return the Client

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

There are a suite of integration test which work against test net. You will need to specifucy a phrase which possess testnet coins

```bash
export PHRASE="secret phrase here"
yarn run integration_tests
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
