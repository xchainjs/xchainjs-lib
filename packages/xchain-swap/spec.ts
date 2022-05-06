

/**  Gathers all the information for a Swap. Can be called mutiple.
 * Informs user of the fees and expected outbound value and wait time. 
 * Will need to convert asset amounts to RUNE to do comparisons.
 * This is for information only, hence the memo or addresses are not required.
 *
 * PrepareSwap()
 * 
 * Inputs:
 * @param sourceAsset
 * @param inputAmount
 * @param destinationAsset
 * @param affiliateFee
 * 
 * Returns in json:
 *  @param inboundFee
 *  @param outboundFee
 *  @param swapFee
 *  @param slip
 *  @param expectedReturnedDestinationAsset
 *  @param expectedWait
  *  @param halted
 * 
 * Logic
 *  Validate the request
 * 
 *  call inbound_address from midgard and store
 *      inbound fee = source asset fee
 *      oubound fee *3 inbound fee
 *      Pool Halted Status
 * 
 *  If sourceAsset !RUNE && inputAmount !RUNE then dobule swap.
 * 
 * if double swap
 *  Swap(sourceAsset, RUNE)
 *  Swap(RUNE, destinationAsset)
 * else 
 *  Swap(sourceAsset, destinationAsset)
 * 
 * for each swap conducted 
 *     Get Pool Depths from Midgard
 *     Get Swap Fee and Slip 
 * 
 *  calc affiliateFee
 * 
 * 
 * totalFee = 
 *  inboundFee + 
 *  swapFee +
 *  outboundFee +
 *  affiliateFee
 *     
 *  Ensure inbound amount is greater than total fee amount
 *      expectedReturnedDestinationAsset = inboundAsset - totalFee
 * 
 * Expected Wait
 * 1. Work out requried confi time for inbound + outbound (https://docs.thorchain.org/chain-clients/overview#confirmation-counting)
 * 2. Work out outbound throttle time. Max 1000 RNE per block, up to 720 blocks. (Copy logic from manager_txout_current.calcTxOutHeight()L599 this part can be in version 2).
 * 
 * Return values
*/

/**  Conducts a swap and sends the transaction
 * Does the checking, constructs the memo and then makes a transation for sending to TC. 
 * Will need to convert asset amounts to RUNE to do comparisons
 * doSwap()
 * 
 * Inputs:
 * @param sourceAsset
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
 *  Check inbound and asset types are valid. inputAmount != 0.
 *
 *  call inbound_address and store
 *      inbound address from source asset (or router if ERC20)
 *      gasRate for inbound and oubound asset types
 *      Pool Halted Status
 *  
 * Constuct Memo
 *  Find Inbound Asset Chain
 *  Find Outboud Asset Chain
 * 

 *  Get LIM
 *      Force LIM to 1% of the inboundasset value
 *  LIM = 8 numbers
 * 
 * Get trading of pool(s) from inbound_address
 * totalFee = 
 *  inboundFee + 
 *  outboundFee +
 *  affiliateFee
 *     
 *  Ensure inbound amount is greater than total fees
 *      expectedReturnedDestinationAsset = InboundAsset - totalFee
 * *  Memo = "=:{destinationAsset}:destinationAddress:LIM&interfaceID:affiliateAddress:affiliateFee" 
 * 
 * construct TX with Memo
 * Send Tx to correct asgardVault or router
 *  
 * Return Tx, expectedWait
 * 
*/

/**validateRequest
 * basic validation of a request before 
 *
 * @param sourceAsset
 * @param inputAmount
 * @param destinationAsset
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
 * 
*/


