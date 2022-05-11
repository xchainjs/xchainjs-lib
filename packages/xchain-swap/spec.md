---
title: "xChainJS THORChain AMM Specification"
---

# Common Functions
## ValidateRequest
Basic validation of a request before running the 

1. `sourceAsset`  - chain.asset
1. `inputAmount`
1. `destinationAsset`  - chain.asset
1. `affiliateFee`

### Midgard Requirements
 1. List of available pools
 1. Pool Depths for a specificed pool
 1. Halt status for a specificed each chain
 1. Inbound and outbound gas_rate / fee for a chai
 
### Logic - just basic checks
```
if sourceAsset <= 0
 return "source asset is 0"

if source asset != RUNE && source asset not in active pool list (https://midgard.thorswap.net/v2/pools where status = "available")
  return "source asset not on pool list"

if destinationAsset != RUNE && destinationAsset not in active pool list (https://midgard.thorswap.net/v2/pools where status = "available")
  return "destination asset not on pool list"

If valueofRUNE(inbound fee + outbound fee) > valueOfRUNE(inboundAsset)
 return "insufficent inbound asset amount "

If sourceAsset == destinationAsset
     return "source and destination cannot be the same"

if affiliateFee < 0 || affiliateFee > 1000
 return "affiliateFee is invalid"

 If (sourceAsset.chainType != RUNE)
    sourceInboundDetails = getInboundDetails(Mainnet, destinationAsset.chainType).isHalted
        If (inboundDetails.isHalted)
         return "source chain halted"

If (destinationAsset.chainType != RUNE)
    destinationInboundDetails = getInboundDetails(Mainnet, sourceAsset.chainType).isHalted
        if (destinationInboundDetails.isHalted)
            return "Desitnation chain halted"

Return "Success"
```

## requiredConfTime()
Works out the expected wait time for any transaction, in or out based on the conf counting. Call twice to find the in + out bound time due to conf counting. 

Note: conf counting is done in the ChainClient interface within THORChain, so it might be best to have this function in each chain cliednt. e.g.  = chain.RequiredConfTime(inputAmount)
Should return the just the time in seconds. 

### Inputs
1. `Asset`  - chain.asset
1. `inputAmount`

### Returns:
1. `WaitTime` (approx waitTime in seconds)

### Midgard Requirements
None. 

### Logic - Conf Counting
See https://docs.thorchain.org/chain-clients/overview#confirmation-counting
```
requiredConfs = ceil (inputAmount in Asset / BlockReward for the chain)
returns (requiredConfs * chainBlockTime)
```

## outboundDelay()
This will be the Min Outbound delay time. Could be more depending on network activity. 

### Inputs
1. `Asset`  - chain.asset
1. `outputAmount`

### Returns:
1. `WaitTime` (approx waitTime in seconds)

### Midgard Requirements
1. Mimir values
1. Outbound Queue (https://midgard.thorswap.net/v2/thorchain/queue) 

### Logic
Get the Mimir values 
```
Mimir Values:
minTxOutVolumeThreshold = 1000 RUNE
txOutDelayRate = 25
maxTxOutOffset = 720
```

Look at the value of the outboundTx and decide if it is going in the next block or not
```
runeValue = runeValueOf(outputAmount)

if runeValue < minTxOutVolumeThreshold
    Return 6 // likley next block. 

sumValue = runeValue + scheduled_outbound_value (https://midgard.thorswap.net/v2/thorchain/queue)

// reduce delay rate relative to the total scheduled value. In high volume
// scenarios, this causes the network to send outbound transactions slower,
// giving the community & NOs time to analyze and react. In an attack
// scenario, the attacker is likely going to move as much value as possible
// (as we've seen in the past). The act of doing this will slow down their
// own transaction(s), reducing the attack's effectiveness.
txOutDelayRate -= sumValue / minTxOutVolumeThreshold

// calculate the minimum number of blocks in the future the txn has to be
	minBlocks = (runeValue) / txOutDelayRate 

// if it is greatner than 720 blocks (1 hour, outbound will be max 1 hour)
if minBlocks > maxTxOutOffset {
    minBlocks = maxTxOutOffset
}
```
More detail can be added to get the target block but it needs to take into consideration the TxOutValue for each block between current hight and minBlocks. May be too complex.

```
return minBlocks * 6 // THORChain block time, can also do Constants.BlocksPerYear / seconds in a year.
```

# Swap Functions
## prepareSwap()

### Overview
Gathers all the information for a Swap. Can be called mutiple times within an interface. 
Informs user of the fees and expected outbound value, wait time and if over the set slip limit
This is for information only, hence the memo or addresses are not required.
Will need to convert asset amounts to RUNE to do comparisons.

###  Inputs:
1. `sourceAsset`  - chain.asset
1. `inputAmount`
1. `destinationAsset`  - chain.asset
1. `affiliateFee` (in %)
1. `slipLimit` - e.g 1% or 3% max allowed slip

### Returns in json:
1.  `totalFees` object 
    (denoted in destinationAsset amount)
   `{ total, inboundFee, swapFee , outboundFee, affiliateFee}`
 1. `slip` (in %)
 1. `expectedReturnedDestinationAsset`
 1. `expectedWait`
 1. `halted` - if any used chain is halted

### Midgard Requirements
 1. Pool Depth for `sourceAsset` (if Double Swap, depths for sourceAsset and destinationAsset)
 1. Halt status for each chain used
 1. Inbound and outbound gas_rate

#### Logic Requirements
See more defined logic at https://github.com/xchainjs/xchainjs-lib/blob/549-add-xchainjs-swap-package/packages/xchain-swap/src/client/client.ts#L29  
Conduct the swap. Done at https://github.com/xchainjs/xchainjs-lib/blob/549-add-xchainjs-swap-package/packages/xchain-swap/src/utils/swap.ts#L23 

Work out the total Fee
See 
1. https://dev.thorchain.org/thorchain-dev/thorchain-and-fees
1. https://dev.thorchain.org/thorchain-dev/wallets/swapping-guide#calculating-slippage  
1. https://dev.thorchain.org/thorchain-dev/thorchain-and-fees#affiliate-fees 

Work out the totalFee
```
 Ensure outputAmount is greater than total fee amount
    if outputAmount >= totalFee
        return "not enough inboundAmount to conduct swap"

 expectedReturnedDestinationAsset = inputAmount - totalFee

confiTIme = requiredConfTime(inputAmount) + requiredConfTime(expectedReturnedDestinationAsset) 
outboundDelay = outboundDelay(expectedReturnedDestinationAsset)

// conf counting is independent of outboundDelay, so need to find out which is longer. 
If outboundDelay > confiTIme
  expectedWait = outboundDelay
else
  expectedWait = confiTIme

Return values
```
## doSwap()

Conducts a swap and sends the transaction. Does not look at LIM or a slip limit
Does the checking, constructs the memo and then makes a transation for sending to TC. 
Will need to convert asset amounts to RUNE to do comparisons

### Inputs:
1. `sourceAsset`  - chain.asset
1. `inputAmount`
1. `destinationAsset` - chain.asset
1. `destinationAddress`
1. `affiliateFee`
1. `affiliateAddress`
1. `interfaceID` - 3 numbers (Thorswap - 111; Asgardex - 999; Defispot: ?; Thorwallet: ?; Ferz wallet: ?; Shapeshift: ?; Rango: ? )
1. `slipLimit`

### Returns in json:
 1. `transactionID` - for the Tx created
 1. `expectedWait` - expected total wait time.


### Midgard Requirements
 1. Pool Depth for sourceAsset  (if Double Swap, depths for sourceAsset and destinationAsset)
 1. Halt status for each chain used
 1. Inbound and outbound gas_rate
 1. Asgard Vault Address to send the Tx do (I think depost does that already)


#### Logic
```
 ValidateRequest
 Validate destinationAsset
 ```
 Get the totalFee, same as in prepareSwap but there will be no Slip or LIM.
 Check total fee against 'inputAmount' 
```
`totalFee` =
 inboundFee +
 outboundFee +
 affiliateFee

    If valueInRUNE(totalFee) > valueInRUNE(inputAmount)
        "not enough inboundAmount to conduct swap"
```
Constuct Memo - Work out LIM. Add interface ID
```
    LIM is (1-slipLimit%outputAmount value), eg if slip limit = 1% than LIM (output amount) is  99% 
        Then remove the last 3 digits, and replace with the 3-digit interface ID
        12341234 -> 12341xxx, where xxx is interfaceID

    Memo = "=:{destinationAsset}:destinationAddress:LIM&interfaceID:affiliateAddress:affiliateFee"

    If destinationAsset = BTC.BTC and Memo.Length() > 80 // drop affiliate and use shortened assets
                Memo = "=:{destinationAsset}:destinationAddress:LIM&interfaceID"

```
Calc the waitTime then send the TX to THORChain Asgard Vault
```
confiTIme = requiredConfTime(inputAmount) + requiredConfTime(LIM) 
outboundDelay = outboundDelay(LIM)

// conf counting is independent of outboundDelay, so need to find out which is longer. 
If outboundDelay > confiTIme
  expectedWait = outboundDelay
else
  expectedWait = confiTIme

construct TX with Memo and inbound gas_rate
Send Tx to correct asgardVault or router

Polls TC to ensure the trasnaction was successful. (this might be a differet function that monitors a given Tx)

Return Tx, expectedWait
```
# Liquidity Functions
## addLiquidity()
Adds liquidity into THORChain from a user's wallet. 

### Inputs:
1. `sourceAsset[]`  maybe 1 or two assets
1. `inputAmount[]`  maybe 1 or two assets

### Returns:
 1. `transactionID` - for the Tx created
 1. `expectedWait` - expected total wait time.

### Midgard Requirments
1. List of available Pools

### Logic

Do basic checks. SourceAsset is an active pool, assetAmount != 0 and so on. 

See if it is a Asym or Sim deposit. 
If Asym, will need to know which asset is being sent by using the sourceAsset

Constuct Memo.
```
If Asym (only one asset added)
    Memo = "+:{Pool}:affiliateAddress:affiliateFee"
Else // Sym - both assets added.
    Memo = "+:{Pool}:{PAIREDADDR}:affiliateAddress:affiliateFee"
    Note, deposit will be pending till PAIREDADDR is added.
```
TotalFee = InboundFee

expectedWait = RequiredConfCounting()

Return `txID`

## withdrawLiquidity()
Removes liquidity for a user

### Inputs
1. `Pool Name` - the pool to remove from
1. `Wallet Address []` - maybe 1 or 2
1. `BasisPoints` in % (% of total liquidity to be remove. 1-100%).
1. `Asym Withdraw` Bool

### Returns
1. `TxID` - sent transaction ID

### Midgard Requirements
1. `LP Details https://midgard.thorswap.net/v2/member/{address}`
1. `Pool List https://midgard.thorswap.net/v2/pools `

See if the the pool is valid
See if their wallet is a member of the pool. 
See if the addtion was single sided or dual sided.

Work out basis points
```
Note: BasisPoints will be the % of the liquidity units withdraw.
BasisPoints = BasisPoints * 100 // 100 = (1%), 5000 = 50%

If BasisPoints <= 0 || BasisPoints > 10000
    Return "BasisPoints is invalid"
```
If addition was single sided (asymed), then force withdraw asym

If asym, need to know in which asset they want to get. ASSET or RUNE. 
```
If Asym
    Memo = "-:{PoolName}:BasisPoints" // will return RUNE and Asset to the deposit address
Else
    Memo = "-:{PoolName}:BasisPoints:{Asset} // returns RUNE or ASSET (asset param sets it) to the depost addresses which TC already knows about. 
```

 create transaction with memo

Return `txID`
