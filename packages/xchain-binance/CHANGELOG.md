# v.5.6.7 (2023-01-19)

## Update

- Type safety `BNBChain`

## Update

- Bump `xchain-client@13.5.0`

# v.5.6.5 (2022-10-13)

## Update

- Bump `xchain-client`

# v.5.6.4 (2022-10-13)

## Update

- Set Default network to `Network.Mainnet`

# v.5.6.3 (2022-xx-xx)

## Update

- Bumped `xchain-utils` & `xchain-client`

# v.5.6.2 (2022-09-29)

## Update

- bumped deps on xchain-utils & xchain-client

# v.5.6.0 (2022-09-05)

## Update

- bumped deps on xchain-utils & xchain-client

# v.5.5.0 (2022-07-21)

### Breaking change

- client.deposit() removed, all thorchain deposits were moved to xchain-thorchain-amm

# v.5.4.3 (2022-05-05)

## Update

- Add `deposit` to Binance `Client`
- Update latest dependencies
- Add tests for `deposit`

# v.5.4.2 (2022-02-04)

## Update

- xchain-util@0.5.1
- xchain-client@0.11.1

# v.5.4.1 (2022-02-02)

## Update

- xchain-util@0.5.0

# v.5.4.0 (2021-12-29)

## Breaking change

- Add stagenet environment handling for `Network` and `BaseXChainClient` changes client to default to mainnet values until stagenet is configured.

# v.5.3.1 (2021-09-03)

- updated to the latest dependencies

# v.5.3.0 (2021-08-27)

- Add `getAccount`

# v.5.2.6 (2021-07-26)

- fixed missing walletIndex in client.transfer()

# v.5.2.5 (2021-07-18)

- Updatedrollupjs to include axios to enlable usage on node

# v.5.2.4 (2021-07-07)

- Use latest `xchain-client@0.10.1` + `xchain-util@0.3.0`

# v.5.2.3 (2021-07-05)

- refactored client methods to use regular method syntax (not fat arrow) in order for bcall to super.xxx() to work properly

# v.5.2.2 (2021-06-29)

- added support for pulling fees from thornode.

# v.5.2.1 (2021-06-01)

- update peerDependencies

# v.5.1.0 (2021-05-17)

### Breaking change

- added support for HD wallets

# v.5.0.0 (2021-05-05)

### Breaking change

- Latest @xchainjs/xchain-client@0.8.0
- Latest @xchainjs/xchain-util@0.2.7

# v.4.7.0 (2021-03-02)

### Breaking change

- replace `find`, `findIndex`
- Update @xchainjs/xchain-client package to 0.7.0

# v.4.6.0 (2021-02-24)

### Breaking change

- Update @xchainjs/xchain-client package to 0.6.0
- Update `getBalance`

# v.4.5.0 (2021-02-19)

### Breaking change

- Update @xchainjs/xchain-client package to 0.4.0
- Update @xchainjs/xchain-crypto package to 0.2.3

### Update

- Update @xchainjs/xchain-client package to 0.5.0
- Add `Service Providers` section in README.md
- Update `peerDependencies`

# v.4.4.2 (2021-01-30)

- Clear lib folder on build

# v.4.4.1 (2021-01-15)

### Change

- Export `getPrefix`

# v.4.4.0 (2021-01-15)

### Update

- Update comments for documentation
- Add `getPrefix`

# v.4.3.0 (2020-12-28)

### Breaking change

- Extract `getDefaultFees` from `Client` to `utils` #157
- Remove `validateAddress` from `BinanceClient`

# v.4.2.0 (2020-12-11)

### Update

- Update dependencies
- Add `getDefaultFees`
- Add `getSingleAndMultiFees`
- Add `getDerivePath` helper

# v.4.1.0 (2020-11-20)

### Breaking change

- Update @xchainjs/xchain-crypto package to 0.2.0, deprecating old keystores

# v.4.0.0 (2020-11-11)

### Breaking change

- Remove `freeze` and `unfreeze` related functions: `getFreezeFees()`, `freeze()`, `unfreeze()`, `getFreezeFees()`
- Ignore `freeze` and `unfreeze` txs in `parseTx()`
- Ignore `freeze` and `unfreeze` txs in `getTxType()`

# v.3.1.1 (2020-11-09)

### Change

- updated `xchain-client` package version

# v.3.1.0 (2020-11-06)

### Add

- `getTransactionData(txId: string): Promise<Tx>`

- `asset` parameter to the `getTransactions` method

### Change

- `getExplorerUrl` is public now

### Fix

- Fixed asset parsing for `getBalance` method

# v.3.0.1 (2020-08-26)

- Change type of `amount` to `BigSource` in `normalTx`, `vaultTx`, `freeze`, `unfreeze`

# v.3.0.0 (2020-08-26)

### Breaking changes:

- `Constructor` argument is an object now `{ network: Network; phrase?: string }`
- `getAddress` returns undefined if `phrase` has not been set before
- `getPrivateKey()` throws an error if `phrase` has not been set before
- `setPrivateKey` rejects if a `phase` has not been set before
- `vaultTx`, `normalTx`, `multiSend`, `getMarkets` accept an object as its parameters

### Add:

- `freeze(params: FreezeParams): Promise<TransferResult>`
- `unfreeze(params: FreezeParams): Promise<TransferResult>`
- `getBncClient(): BncClient`

### Fix:

- Fix `Rollup` warnings of `Unresolved dependencies` and `Circular dependencies`

### Update:

- Use latest npm dependencies

# v.2.1.1 (2020-08-14)

- Fix result type of `getFees()`

# v.2.1.0 (2020-08-14)

### Add:

- `getFees()`
- `TxFee`

# v.2.0.0 (2020-07-20)

- BREAKING CHANGE: `getTransactions` expects `GetTxsParams` as its parameter
- Refactored implementation of `getTransactions`
- Use latest `@binance-chain/javascript-sdk@4.0.5"
- Fix `Tx` type

# v.1.0.0 (2020-05-14)

Refactors the client to be constructed with a `net` and optional `phrase`

```
import BinanceClient, { Network } from '../src/client'
...
const net = Network.MAIN
const phrase = process.env.VAULT_PHRASE
const bnbClient = new BinanceClient(net, phrase)
```

### Removal:

- init()
- initClient()
- setPrivateKey()
- removePrivateKey()

### Change:

- getClientUrl(): string -> Class-based
- getExplorerUrl(): string -> Class-based
- getPrefix(): string -> Class-based

### Add:

- setNetwork(net: Network): void
- getNetwork(): Network
- generatePhrase(): string
- setPhrase(phrase?: string): void
- validatePhrase(phrase: string): boolean
- getAddress(): string
- validateAddress(address: string): boolean
- getBalance(address?: Address): Promise<Balance>
- getTransactions(address?: string): Promise<any[]>
- vaultTx(addressTo: Address, amount: number, asset: string, memo: string): Promise<TransferResult>
- normalTx(addressTo: Address, amount: number, asset: string): Promise<TransferResult>

# v.0.1.0 (2020-04-13)

First release
