import { Client } from "@xchainjs/xchain-client"
import { poolDepths } from '../utils/pool'


/**
* *  Check inbound and asset types are valid. inputAmount != 0.
 *
 *  call inbound_address from midgard and store
 *      gasRate for inbound and oubound asset types
 *      Pool Halted Status
 *
 *  Determine if one or two swaps
 *      If sourceAsset !RUNE && inputAmount !RUNE then dobule swap.
 *
 * For each swap
 *      Get Pool Depths from Midgard
 *      Get Swap Fee and Slip
 *      Calc affiliateFee
 *  (many swap functions already in util)
 * If dobuleSwap, add up swap and slip
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


