

/**  Gathers all the information for a Swap. Can be called mutiple.
 * Informs user of the fees and expected outbound value and wait time. 
 * Will need to convert asset amounts to RUNE to do comparisons.
 * This is for information only, hence the memo or addresses are not required.
 *
 * PrepareSwap()
 * 
 * Inputs:
 * @param sourceAsset  - chain.asset
 * @param inputAmount
 * @param destinationAsset  - chain.asset
 * @param affiliateFee (in %)
 * 
 * Returns in json:
 *  @param totalFees object (denoted in destinationAsset amount)
 *    { total, inboundFee, swapFee , outboundFee, affiliateFee}
 *  @param slip (in %)
 *  @param expectedReturnedDestinationAsset
 *  @param expectedWait
 *  @param halted
 * 
 * Logic
 *  Validate the request(see below)
 * 
 *  Call inbound_address from midgard and store
 *      inbound fee = sourceAsset fee
 *      oubound fee * 3 inbound fee of destinationAsset
 *      Pool Halted Status
 * 
 *  If sourceAsset !RUNE && destinationAsset !RUNE then dobule swap.
 * 
 * if double swap
 *  Get Pool Depths from Midgard
 *  outputRUNE = Swap(sourceAsset, RUNE)
 *  outputAmount = Swap(RUNE, destinationAsset)
 *  Get total Swap Fee and Slip
 * else 
 *  outputAmount = Swap(sourceAsset, destinationAsset)
 *  Get total Swap Fee and Slip
 * 
 * calc affiliateFee
 * 
 * 
 * totalFee = 
 *  inboundFee + 
 *  swapFee +
 *  outboundFee +
 *  affiliateFee
 * 
 *  Ensure outputAmount is greater than total fee amount
 *     if outputAmount >= totalFee
 *         "not enough inboundAmount to conduct swap"
 *     
 *  expectedReturnedDestinationAsset = inputAmount - totalFee
 * 
 * Call Expected Wait (see below)
 * 
 * Return values
*/

/**  Conducts a swap and sends the transaction
 * Does the checking, constructs the memo and then makes a transation for sending to TC. 
 * Will need to convert asset amounts to RUNE to do comparisons
 * doSwap()
 * 
 * Inputs:
 * @param sourceAsset  - chain.asset
 * @param inputAmount
 * @param destinationAsset - chain.asset
 * @param destinationAddress
 * @param affiliateFee
 * @param affiliateAddress
 * @param slipLimit - e.g 1% or 3% max allowed slip
 * @param interfaceID - 3 numbers
 * 
 * Returns in json:
 *  @param transactionID - for inbound asset. 
 *  @param expectedWait - for inbound asset. 
 * 
 * 
 * Logic
 *  Validate the request(see below)
 *  Validate Address are correct type
 *
 *  Call inbound_address from midgard and store
 *      inbound fee = sourceAsset fee
 *      oubound fee * 3 inbound fee of destinationAsset
 *      Pool Halted Status for pool(s)
 * 
 *  Get LIM
 *      Force LIM to 1% of the destinationAsset value
 *  LIM = 8 numbers
 * 
 * 
 * totalFee = 
 *  inboundFee + 
 *  outboundFee +
 *  affiliateFee
 *     
 *  If valueInRUNE(totalFee) > valueInRUNE(inputAmount)
 *      "not enough inboundAmount to conduct swap"
 * 
 * Constuct Memo
 *   Memo = "=:{destinationAsset}:destinationAddress:LIM&interfaceID:affiliateAddress:affiliateFee" 
 * 
 *  If destinationAsset = BTC.BTC and Memo.Length() > 80 // drop affiliate and use shortened assets 
 *             Memo = "=:{destinationAsset}:destinationAddress:LIM&interfaceID" 
 * 
 * construct TX with Memo and inbound gas_rate
 * Send Tx to correct asgardVault or router
 *  
 * Call Expected Wait (see below)

 * 
 * Return Tx, expectedWait
 * 
*/

/**validateRequest
 * basic validation of a request before 
 *
 * @param sourceAsset  - chain.asset
 * @param inputAmount
 * @param destinationAsset  - chain.asset
 * @param affiliateFee
 * 
 * 
 * if sourceAsset <= 0
 *  return "source asset is 0"
 * 
 * if source asset != RUNE && source asset not in active pool list (https://midgard.thorswap.net/v2/pools where status = "available")
 *   return "source asset not on pool list"
 * 
 * if destinationAsset != RUNE && destinationAsset not in active pool list (https://midgard.thorswap.net/v2/pools where status = "available")
 *   return "destination asset not on pool list"
 * 
 * If valueofRUNE(inbound fee + outbound fee) > valueOfRUNE(inboundAsset)
 *  return "insufficent inbound asset amount "
 * 
 * If sourceAsset == destinationAsset
 *      return "source and destination cannot be the same"
 * 
 * if affiliateFee < 0 || affiliateFee > 1000
 *  return "affiliateFee is invalid"
 * 
 *  
*/

/**Expected Wait
 * Works out the expected wait time for any transaction based on the conf counting and outbound throttling. 
 * 1. Work out requried confi time for inbound + outbound (https://docs.thorchain.org/chain-clients/overview#confirmation-counting)
 * 2. Work out outbound throttle time. Max 1000 RNE per block, up to 720 blocks. (Copy logic from manager_txout_current.calcTxOutHeight()L599 this part can be in version 2).
 * 
 * @param sourceAsset  - chain.asset
 * @param inputAmount
 * @param destinationAsset - chain.asset
 * @param destinationAddress
 * 
 * Returns:
 * @param WaitTime (either TC blocks or Mins)
 * 
 * Required Confs time =
 * 
 * Layout the blocktime in seconds of each chain. E.g.
 *  THORChain = 5.5 seconds
 *  BNB 5 sec
 *  ETH 14 Sec
 *  BTC 36000 seconds
 * layout the block reward of each chain
 * 
 * BTC = 6.25
 * ETH = 3
 * BNB = 
 * THORChain = 
 * 
 * 
 * required confs = ceil (txValue in Asset / BlockReward for the chain)
 * 
 * Time in secs = required confs * blocktime
 *   
 * 
*/

