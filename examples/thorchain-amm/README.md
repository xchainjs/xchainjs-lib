# THORChain AMM

THORChain AMM examples to show different use cases using the THORChain protocol

## Examples

### Rune pool

#### Deposit Rune to Rune pool

Check out how you should deposit Rune to Rune pool in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/thorchain-amm/runepool-deposit.ts) or run it in the [live example](https://codesandbox.io/p/devbox/github/xchainjs/xchainjs-lib/tree/master/examples/thorchain-amm) with the following command

```sh
yarn depositRunePool phrase amount
```

#### Withdraw Rune from Rune pool

Check out how you should withdraw Rune from Rune pool in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/thorchain-amm/runepool-withdraw.ts) or run it in the [live example](https://codesandbox.io/p/devbox/github/xchainjs/xchainjs-lib/tree/master/examples/thorchain-amm) with the following command

```sh
yarn withdrawRunePool phrase withdrawBps affiliate feeBps
```

### Trade asset

#### Deposit to trade account

Check out how you should deposit an amount to you Trade account in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/thorchain-amm/tradeasseet-deposit.ts) or run it in the [live example](https://codesandbox.io/p/devbox/github/xchainjs/xchainjs-lib/tree/master/examples/thorchain-amm) with the following command

```sh
yarn depositToTradeAccount phrase amount decimals asset
```

#### Withdraw from trade account

Check out how you should withdraw an amount from your Trade account in this [example](https://github.com/xchainjs/xchainjs-lib/blob/master/examples/thorchain-amm/tradeasseet-withdraw.ts) or run it in the [live example](https://codesandbox.io/p/devbox/github/xchainjs/xchainjs-lib/tree/master/examples/thorchain-amm) with the following command

```sh
yarn withdrawFromTradeAccount phrase amount asset
```