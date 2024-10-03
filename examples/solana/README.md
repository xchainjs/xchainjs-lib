# Solana

Solana examples to show different use cases using its client

## Examples

### Balances

#### Get all balances

Check out how you should get all balances an address owns in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/solana/balances-all.ts) or run it as

```sh
yarn allBalances address
```

#### Get specific asset balance

Check out how you should get specific token balances an address owns in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/solana/balance.ts) or run it as

```sh
yarn tokenBalance address token
```

### Addresses

#### Get address by index

Check out how you should get you account address at certain index in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/solana/address.ts) or run it as

```sh
yarn address phrase index
```

### Transactions

#### Prepare transaction

Check out how you should prepare a transaction to be signed in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/solana/transaction-prepare.ts) or run it as

```sh
yarn prepareTx sender recipient asset assetDecimals amount
```

#### Make transaction

Check out how you should make a Solana native asset transaction in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/solana/transaction-transfer.ts) or run it as

```sh
yarn transfer phrase recipient amount
```

#### Make token transaction

Check out how you should make a Solana token transaction in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/solana/transaction-transfer-token.ts) or run it as

```sh
yarn transferToken phrase recipient asset assetDecimals amount
```