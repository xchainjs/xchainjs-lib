# v0.8.2 (2023-11-16)

## Update

- Runescan explorer

# v0.8.1 (2023-11-16)

## Update

- Created method getAddressAsync

# v0.8.0 (2023-11-15)

## Update

- Default gasPrice in baseAmount unit. Changed from GWei to Wei

# v0.7.18 (2023-11-12)

## Update

- Update EVM clients to use Routescan and Etherscan provider compatible with Routescan
- update Midgard & Query & thornode deps
- Remove fromAddress from quoteSwap() params - no longer needed

# v0.7.17 (2023-11-12)

## Update

- Transfer bug fix with txSigner, sender address can be retrieved from signer

# v0.7.16 (2023-11-11)

## Update

- Thorchain package version from 0.28.10 to 0.28.11

# v0.7.15 (2023-11-10)

## Update

- Utxo clients version updated

# v0.7.14 (2023-11-07)

## Update

- Update thorname estimation and prepareTx cosmos chains

# v0.7.13 (2023-11-05)

## Update

- Wallet can be initialised with a custom config by chain

# v0.7.12 (2023-11-05)

## Update

- Update deps for xchain-thorchain-query

# v0.7.11 (2023-11-04)

## Update

- thorchain-query package from 0.6.7 to 0.6.8

# v0.7.10 (2023-11-02)

## Update

- Force Thorchain estimations

# v0.7.9 (2023-11-03)

## Update

- Native asset for dustAmount and dustThreshold

# v0.7.8 (2023-10-31)

## Update

- Bumped deps for Doge and Query

# v0.7.7 (2023-10-26)

## Update

- Refactor transfer method to use prepareTx

# v0.7.6 (2023-10-19)

## Update

- Update deps for thorchain-query & thornode

# v0.7.5 (2023-10-09)

## Update

- Increase client versions for supporting 'sender' option on `getFees()``

# v0.7.4 (2023-10-09)

## Update

- Fix pending UTXOs bug
- Increate default fee estimation

# v0.7.3 (2023-10-06)

## Update

- Update deps for thorchain-query && thornode && midgard

# v0.7.2 (2023-09-24)

## Update

- Support transefer and renewal THORNames

# v0.7.1 (2023-09-18)

## Update

- Add functions getThornamesByAddress, registerThorname and updateThorname

# v0.7.0 (2023-09-10)

## Update

- Replace calls to Midgard, now made using the midgard-query package

# v0.6.0 (2023-09-04)

## Update

- Update peer deps, thorchain-query

# v0.5.9 (2023-08-14)

## Update

- update deps, query, thorchain, evm, ethereum, avax, bsc

# v0.5.8 (2023-07-26)

## Update

- Updated dependencies for cosmos, thorchain & query

# v0.5.7 (2023-07-10)

## Update

- Update deps for avax, bsc, bitcoin, doge & litecoin

# v0.5.6 (2023-06-28)

## Update

- Update deps for thorchain-query & mayachain
- Udpate deps for thorchain

# v0.5.5 (2023-06-21)

## Update

- Updated dependencies for thornode, thorchain && thorhcain-query

# v0.5.4 (2023-06-01)

## Update

- Updated mayachain, ethereum, bitcoincash dependencies

# v0.5.3 (2023-05-22)

## Update

- Add getLoanQuoteClose & getLoanQuoteOpen to thorchainamm
- Bumps Query dep

# v0.5.2 (2023-05-18)

## Update

- Add Mayachain to wallet class
- Bumps deps

# v0.5.1 (2023-05-10)

## Update

- Bump thornode & thorchain-query deps

# v0.5.0 (2023-05-03)

## Update

- Updated thorchain-amm to wrap the latest swap quote from thorchain-query
- removed waitTimesSeconds from ExecuteSwap,TxSubmitted

# v0.4.0 (2023-05-02)

## Update

- update rollup config and axios to the latest
- update `bitoinCashjs-lib`

# v0.3.25 (2023-04-24)

## Add

- Bump packages

# v0.3.24 (2023-04-14)

## Fix

- `addSaver` bug with AddAmount
- Error handling for `withdrawSaver()`

# v0.3.23 (2023-04-12)

## Add

- case for `synths` in `validateSwap()`

# v0.3.22 (2023-04-05)

## Add

- Bump packages
- change erc-20 depositWithExpiry gaslimit to 160000

# v0.3.21 (2023-04-04)

## Add

- Bump packages
- Add `erc-20` approval check in `thorchain-amm.estimateSwap()`

## Fix

- Pass `FeeOption` enum through `executeSwap()`

# v0.3.20 (2023-03-27)

## Update

- Bump packages

# v0.3.19 (2023-03-21)

## FIX

- Update package deps
- Update wallet client() settings

# v0.3.18 (2023-3-2)

## FIX

- ERC-20 approve bug
- update dependencies

# v0.3.17 (2023-2-15)

## Add

- `xchain-bsc`: "0.1.0"

# v0.3.16 (2023-2-8)

## Update

- Bump:
- `xchain-bitcoin`
- `xchain-litecoin`
- `xchain-doge`

# v0.3.15 (2023-2-6)

## Update

- Bump:
- `xchain-thorchain-query`

# v0.3.14 (2023-1-26)

## Update

- Bump:
- `xchain-thorchain-query`

# v0.3.13 (2023-1-24)

## Update

- Bump:
- `xchain-avax`: "^0.1.4",
- `xchain-binance`: "^5.6.7",
- `xchain-bitcoin`: "^0.20.8",
- `xchain-bitcoincash`: "^0.15.7",
- `xchain-cosmos`: "^0.20.7",
- `xchain-doge`: "^0.5.7",
- `xchain-ethereum`: "^0.27.7",
- `xchain-litecoin`: "^0.10.9",
- `xchain-midgard`: "0.4.1",
- `xchain-thorchain-query`: "^0.1.14",

# v0.3.12 (2022-12-29)

## Update

- Bump:`xchain-thornode@0.2.0`

# v0.3.11 (2022-12-27)

## Update

- Bump:
- `xchain-avax@0.1.3`
- `xchain-binance@5.6.6`
- `xchain-bitcoin@0.20.7`
- `xchain-bitcoincash@0.15.6`
- `xchain-client@0.13.5`
- `xchain-cosmos@0.20.6`
- `xchain-ethereum@0.27.6`
- `xchain-evm@0.1.3`
- `xchain-litecoin@0.10.8`
- `xchain-thorchain@0.27.7`
- `xchain-util@0.12.0`
- Change `Asset*` and `*Chain` imports from `xchain-util` to its respective `xchain-*`
- Update README.md dependency specification

# v0.3.10 (2022-12-08)

## udpate

- changed eth & evm deposit() to use depositWithExpiry() with a 15 min expiry time

# v0.3.9 (2022-11-24)

## udpate

- Bump `xchain-client`

# v0.3.8 (2022-11-08)

## Update

- added `addSaver()` & `withdrawSaver()` to thorchain-amm

# v0.3.7 (2022-11-10)

## Update

- added missing 'await' statements in thorchain-amm

# v0.3.6 (2022-11-08)

## Update

- changed chain-id in wallet to `thorchain-stagenet-v2`
- removed clienturl params in wallet

# v0.3.5 (2022-10-27)

## Update

- Bump Dep for `thorchain-query`
- Bump Dep for `xchain-litecoin`

# v0.3.4 (2022-10-27)

## Update

- Bump Dep for `thorchain-query`
- update to `getInboundDetails()`

# v0.3.3 (2022-10-17)

## Update

- Bump Dep version number for `xchain-midgard`, `thorchain-query`
- Change ExecuteSwap() parameters to use constructed memo from `estimateSwap()`
- Remove `constructMemo()` from wallet.ts
- validate affiliate address is either a valid thorchain adress OR a valid thorname
- Clean types file

# v0.3.3 (2022-10-17)

## Update

- default to mainnet and stadard APIs with no arg constructor

# v0.3.1 (2022-10-11)

## Add

- Add lp add & withdraw
- Bumped `xchain-litecoin`

# v0.3.0 (2022-10-10)

## Update

- Bumped `xchain-thorchain`

# v0.2.1 (2022-10-04)

## Update

- Bumped `xchain-utils` & `xchain-client`

# v0.2.0 (2022-10-04)

## Update

- Updated wallet.ts and evm files to use updated `thorchain-query` `getInboundDetails()`

# v0.0.1.0-beta5 (2022-09-29)

## Update

- bumped deps on xchain-utils & xchain-client

# v0.0.1.0-beta4 (2022-09-15)

- moved examples into different directory
- import new version of xchain-thorchain-query

# v0.0.1.0-beta3 (2022-09-06)

- import new version of xchain-thorchain-query

# v0.0.1.0-beta2 (2022-09-05)

- moved estimate logic into xchain-thorchain-query

# v0.0.1.0-beta (2022-08-15)

- resolved several issues
- added avax client
- added ThorchainCache to manage caching thorchain state

# v0.0.1.0-alpha3 (2022-08-08)

## Remove

- Remove `Polkadot` from chain defaults and chain references/switch cases.

# v0.0.1.0-alpha2 (2022-07-25)

## ADD

- Add `Doswap()` function to thorchain-amm

## Update

- Changed values in `calcSwapNetworkFee` to suite the latest network fees

# v0.0.1.0-alpha (2022-07-20)

## Module Created
