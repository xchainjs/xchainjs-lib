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
--config swap ETH 10%, BTC 10%, ETH.ETH 5%, ETH.USDT 5%, *  
--config addLp ETH 10%, BTC 50%, ETH.USDT 5%, *
--config transfer THOR.RUNE 50%, ETH/USDT 5%, *  
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
