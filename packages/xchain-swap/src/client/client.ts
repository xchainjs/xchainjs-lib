// import { BigNumber } from 'bignumber.js';
// import { Asset, BaseAmount, AssetRuneNative } from "@xchainjs/xchain-util";
// import { getValueOfAssetInRune, getSingleSwap } from '../utils/swap'
// import { Configuration, MIDGARD_API_TS_URL, MidgardApi } from '@xchainjs/xchain-midgard'

// export type TotalFees = {
//   inboundFee: BaseAmount
//   swapFee: BaseAmount
//   outBoundFee: BaseAmount
//   affiliateFee: BaseAmount
// }

// export type SwapEstimate = {
//   totalFees: TotalFees
//   slipPercentage: BigNumber
//   netOutput: BaseAmount
//   isHalted: Boolean
// }

// export type SwapOutputData = {
//   transactionId: string
//   expectedWait: string // or maybe a datetime type
// }

// const midgardApi = new MidgardApi(new Configuration({ basePath: MIDGARD_API_TS_URL }))

// export const estimateSwap = (sourceAsset: Asset, inputAmount: BaseAmount, destinationAsset: Asset, affiliateFee: BigNumber, slipLimit: BigNumber ): SwapEstimate => {

//   // ---------- Checks -----------
//   const isHalted = checkChainStatus(sourceAsset)// only for those chains that are not Thor.
//       // checkChainStatus should live in chain-utils or something. Within xchain-util

// // ---------- Remove Fees from inbound before doing the swap -----------
//   //get inbound Fee from proxyInbound_address then calc the fee as per https://dev.thorchain.org/thorchain-dev/thorchain-and-fees
//   const inBoundFee = inputAmount.minus(inputFee)
//   // take the inbound fee away from the inbound amount
//   const netInput = netInputAmount.minus(inBoundFee)

//   // remove any affiliateFee. netInput * affiliateFee (%age) of the desitnaiton asset type
//   const affiliateFeeAmount = netInput.times(affiliateFee)

//   // remove the affiliate fee from the input.
//    const netInputAmount = netInputAmount.minus(affiliateFeeAmount)

//   // now netInputAmount = inputAmount.minus(inboundFee + affiliateFeeAmount)

//   /// ------- Doing the swap ------------------------
//   // if source and destination != rune then its a double swap.
//   const isDoubleSwap = sourceAsset.symbol != "RUNE" && destinationAsset.symbol != "RUNE"

//    if (!isDoubleSwap) { // if not doulbe swap, e.g a single swap
//     // Need to work out which pool from the source asset. This could prob go in a util function
//     // I assume Leena's idea is just to work the pool instead of a UI passing it down

//       if(sourceAsset != RUNE)
//        const poolName = new string(sourceAsset.Chain & "." & sourceAsset.ticker) // e.g. BTC.BTC
//       else
//       poolName = new string(destinationAsset.Chain & "." & destinationAsset.ticker) // e.g. BTC.BTC

//       const PoolData1 = midgardApi.getPool(poolName)
//       const swapOutput = getSingleSwap(netInputAmount, PoolData1)
//    }
//    else {
//       pool1Name = new string(sourceAsset.Chain & "." & sourceAsset.ticker) // e.g. BTC.BTC
//       pool2Name = new string(destinationAsset.Chain & "." & destinationAsset.ticker) // e.g. BTC.ETH
//       const PoolData1 = midgardApi.getPool(pool1Name) // first pool data
//       const PoolData2 = midgardApi.getPool(pool2Name) // second pool data

//       const swapOutput1 = getSingleSwap(netInputAmount, PoolData1)
//       const swapOutput2 = getSingleSwap(swapOutput1.output, PoolData1)

//       // add up swap1 and swap 2 fees / slips
//    }

// if (totalSlip > slipLimit){
//   }else {
//     throw error "slip is too high at : & totalSlip"
//   }

//   /// ---------------- Remove Outbound Fee ---------------------- //////
//    //get data from proxyInbound_address then calc the fee as per https://dev.thorchain.org/thorchain-dev/thorchain-and-fees
//    // for BNB and RUNE it is fixed. For the rest it is 3* inbound fee
//    const outBoundFee = inputAmount.minus(outBoundFee)

//   const TotalFees = {
//     inboundFee: inboundFee,
//     swapFee: swapFee,
//     outBoundFee: outboundFee,
//     affiliateFee: affiliateFee
//   }

//   const SwapEstimate = {
//     totalFees: TotalFees,
//     slipPercentage: slipOnLiquidity,
//     netOutput: netOutput,
//     isHalted: isHalted
//   }
//   return SwapEstimate
// }

// export const checkChainStatus = (sourceAsset: Asset): Boolean => {
//   const midgardApi = new Midgard() // until midgard is built
//   if(sourceAsset == AssetRuneNative){
//     return true;
//   }else{
//     const data = await midgardApi.getProxiedInboundAddresses()
//     const isHalted = data.find(e => e.chain == sourceAsset.chain)
//     return isHalted?.halted!
//   }
// }
