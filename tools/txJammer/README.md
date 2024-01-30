# `txJammer`

Purpose of this script is to push a random amount of different types of transactions to stagenet to verify new stagenet releases

Use wisely as it deals with real funds.

## Installation

```bash
yarn install
```

### Examples

#### Run Help

```bash
yarn ts-node txJammerCommander.ts --help
node_modules/.bin/ts-node txJammerCommander.ts --help
Usage: txJammerCommander [options]

Options:
  -n, --network <network>          which thorchain network to use... stagenet|mainnet defaults to stagenet
  -e, --estimateOnly               do not perform a swap, only perform an estimate swap
  -w1, --wallet1 <file>            you must send in a json wallet
  -p1, --password1 <password>      you must send in a password for wallet 1
  -w2, --wallet2 <file>            you must send in a json wallet
  -p2, --password2 <password>      you must send in a password for wallet 2
  -d, --durationSeconds <number>   the seconds you want to run the txJammer for
  -p, --pauseTimeMSeconds <number>  the seconds you want to pause between actions
  -u, --txAmountInUsd <min-max>    the value of each tx in USD terms
  -s, --configActions <config>     custom action configuration
  -s, --configSwap <config>        custom swap configuration
  -a, --configAddLp <config>       custom addLp configuration
  -w, --configWithdrawLp <config>  custom withdrawLp configuration
  -t, --configTransfer <config>    custom transfer configuration
  -h, --help                       display help for command
✨  Done in 4.73s.
```

#### Example 1

Runs random txs with a monetary value between 1-3 USD for 60 secs with a pause between actions of 2 secs, but run in "estimate only" mode ( does not submit the txs)

```bash
yarn ts-node txJammerCommander.ts \
 --wallet1 ./keystore1.txt --password1 123 \
 --wallet2 ./keystore2.txt --password2 123 \
 --durationSeconds 60 --pauseTimeMSeconds 2 \
 --txAmountInUsd 1-3 \
 --estimateOnly
```

#### Example 2

Runs random txs with a monetary value between 1-3 USD for 60 secs with a pause between actions of 2 secs, but run in "estimate only" mode ( does not submit the txs)

Additionally, a specfic **Action Config** specified with --configActions, specifies the following:

- transfer should have a probabilistic weight of 500
- addLp should have a probabilistic weight of 0
- withdrawLp should have a probabilistic weight of 0
- swap should have a probabilistic weight of 300

Additionally, a specfic **Swap Config** specified with --configSwap, specifies the following:

- ETH.ETH BTC.BTC swaps should have a probabilistic weight of 500
- BNB.BNB to any other asset should have a probabilistic weight of 200
- swap for every other asset to another asset should have a probabilistic weight of 100

```bash
yarn ts-node txJammerCommander.ts \
 --wallet1 ./keystore1.txt --password1 123 \
 --wallet2 ./keystore2.txt --password2 123 \
 --durationSeconds 60 --pauseTimeMSeconds 2 \
 --txAmountInUsd 1-3 \
 --estimateOnly \
 --configActions "transfer 500, addLp 0, withdrawLp 0, swap 300" \
 --configSwap "ETH.ETH BTC.BTC 500, BNB.BNB * 200, * * 100"
```

#### Example 3

Runs random txs with a monetary value between 1-3 USD for 60 secs with a pause between actions of 2 secs, but run in "estimate only" mode ( does not submit the txs)

Additionally, a specfic **Transfer Config** specified with --configTransfer, specifies the following:

- BNB.BNB transfers should have a probabilistic weight of 300
- BCH.BCH transfers should have a probabilistic weight of 200
- all other asset transfers should have a probabilistic weight of 50

Additionally, a specfic **AddLP Config** specified with --configAddLp, specifies the following:

- BTC.BTC addLp should have a probabilistic weight of 300
- BCH.BCH addLp should have a probabilistic weight of 200
- no other other assetwill be selected to addLp

Additionally, a specfic **WithdrawLP Config** specified with --configWithdrawLp, specifies the following:

- BTC.BTC WithdrawLP should have a probabilistic weight of 300
- BCH.BCH addLp should have a probabilistic weight of 200
- no other other assetwill be selected to withdrawLp

```bash
yarn ts-node txJammerCommander.ts \
 --wallet1 ./keystore1.txt --password1 123 \
 --wallet2 ./keystore2.txt --password2 123 \
 --durationSeconds 60 --pauseTimeMSeconds 2 \
 --txAmountInUsd 1-3 \
 --estimateOnly \
 --configTransfer "BNB.BNB 300, BCH.BCH 200, * 50" \
 --configAddLp "BTC.BTC 300, BCH.BCH 200" \
 --configWithdrawLp "BTC.BTC 100, BCH.BCH 200" \
 --estimateOnly
```
