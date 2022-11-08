 # `txJammer`
Purpose of this script is to push a random amount of difference types of transactions to stagenet to verify new stagenet releases

Use wisely as it deals with real funds. 

## Installation
```
yarn
```

## Usage

Iether modify script to read from keystores or enter seeds directly into script before running.

### Before Running

Add seeds or keyStore


```bash
ts-node txJammer.ts 
```


txJammer --wallet1 ./sdasdasd/asdasd.json --wallet2 ./sdasdasd/asdasd.json 
--durationSeconds 600
--pauseTimeSeconds 5
--txAmountInUsd 0.2-5 
--configSwap ETH.ETH BTC.BTC 100, * * 100  
--configAddLp THOR.RUNE BTC.BTC 500, BTC.BTC 300, * * 100
--configWithdrawLp BTC.BTC S 500-500 A 100-500, * * 100
--configTransfer ETH.ETH 100, BCH.BCH 200, * 100
--estimateOnly






txJammer --wallet1 ./sdasdasd/asdasd.json --wallet2 ./sdasdasd/asdasd.json 
--durationSeconds 60
--pauseTimeSeconds 0
--txAmountInUsd 2-3 
--config swap BCH.BCH BTC.BTC 100  
--config addLp ETH.ETH BTC.BTC 500, * * 100
--config withdrawLp ETH.ETH BTC.BTC 500, * * 100
--config transfer ETH.ETH 100, BCH 200
--estimateOnly






txJammer --wallet1 ./sdasdasd/asdasd.json --wallet2 ./sdasdasd/asdasd.json 
--config swap  *  
--config addLp  *
--config withdrawLp  *
--config transfer *  
--estimateOnly
--outfile ./xxx.json

txJammer --wallet1 ./sdasdasd/asdasd.json --wallet2 ./sdasdasd/asdasd.json 


actions
=======
addLP
withdrawLp
swap (including minet/redeem synth)
transfer  thorchain asset 


  private getRandomInt(max: number, min: number) {
    const cmin = Math.ceil(min)
    const cmax = Math.floor(max)
    return Math.floor(Math.random() * (cmax - cmin + 1)) + cmin
  }