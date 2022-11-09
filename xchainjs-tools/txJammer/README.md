# `txJammer`

Purpose of this script is to push a random amount of difference types of transactions to stagenet to verify new stagenet releases

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
  -e, --estimateOnly               do not perform a swap, only perform an estimate swap
  -w1, --wallet1 <file>            you must send in a json wallet
  -p1, --password1 <password>      you must send in a password for wallet 1
  -w2, --wallet2 <file>            you must send in a json wallet
  -p2, --password2 <password>      you must send in a password for wallet 2
  -d, --durationSeconds <number>   the seconds you want to run the txJammer for
  -p, --pauseTimeSeconds <number>  the seconds you want to pause between actions
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
 --durationSeconds 60 --pauseTimeSeconds 2 \
 --txAmountInUsd 1-3 \
 --estimateOnly
```

#### Example 2

Runs random txs with a monetary value between 1-3 USD for 60 secs with a pause between actions of 2 secs, but run in "estimate only" mode ( does not submit the txs)
Additionally, a specfic action config specifies the following

- transfer should have a probablistic weight of 500
- addLp should have a probablistic weight of 0
- withdrawLp should have a probablistic weight of 0
- swap should have a probablistic weight of 300

```bash
yarn ts-node txJammerCommander.ts \
 --wallet1 ./keystore1.txt --password1 123 \
 --wallet2 ./keystore2.txt --password2 123 \
 --durationSeconds 60 --pauseTimeSeconds 2 \
 --txAmountInUsd 1-3 \
 --estimateOnly \
 --configActions "transfer 500, addLp 0, withdrawLp 0, swap 300" \
 --configSwap "ETH.ETH BTC.BTC 500, BNB.BNB * 200, * * 100"
```
