import { BigNumber } from 'bignumber.js';
import { Asset, BaseAmount, AssetRuneNative } from "@xchainjs/xchain-util";
//import { getSingleSwap } from "../utils";
import { Midgard } from '../../../../../../xchainjs_test/src'


export type TotalFees = {
  inboundFee: BaseAmount
  swapFee: BaseAmount
  outBoundFee: BaseAmount
  affiliateFee: BaseAmount
}

export type SwapEstimate = {
  totalFees: TotalFees
  slipPercentage: BigNumber
  netOutput: BaseAmount
  isHalted: Boolean
}

export type SwapOutputData = {
  transactionId: string
  expectedWait: string // or maybe a datetime type
}
const midgardApi = new Midgard()

export const estimateSwap = (sourceAsset: Asset, inputAmount: BaseAmount, destinationAsset: Asset, affiliateFee: BigNumber, slipLimit: BigNumber ): SwapEstimate => {
  const isHalted = checkChainStatus(sourceAsset)// only for those chains that are not Thor.
  const isDoubleSwap = sourceAsset.symbol != "RUNE" // if source and destination != rune then its a double swap.

  const PoolData1 = midgardApi.getPool(sourceAsset.symbol)// not yet implemented
  //const PoolData2 = midgard(destinationAsset)// not yet implemented

  //const getslip = getSlipOnLiquidity()
  // const inBoundFee = inputAmount.minus(inputFee > from midgard)
  // const netInput = netInputAmount.minus(inBoundFee)
  // const affiliateFeeAmount = inputAmount.times(affiliateFee)
  // const netInputAmount = netInputAmount.minus(affiliateFeeAmount)

  //const slipMax =

  if(isDoubleSwap === true){
    // const swapOneOutput = getSingleSwap(netInputAmount, PoolData1)
    // const swapOutput = getSingleSwap(swapOneOutput.output, PoolData2)
    // resultBefore = runeValue.minus( affiliateFee) perform swaps.
    // resultAfter = resultBefore.minus(outBoundFee)
  }else{
    //const swapOutput = getSingleSwap(netInputAmount, PoolData1)
  }
  //const totalSlip =
  if (totalSlip > slipLimit){
  }else {
    throw error "slip is too high at : & totalSlip"
  }
  //const netOutput = swapOutput.output.minus(outboundFee)

  const TotalFees = {
    inboundFee: inboundFee,
    swapFee: swapFee,
    outBoundFee: outboundFee,
    affiliateFee: affiliateFee
  }


  const SwapEstimate = {
    totalFees: TotalFees,
    slipPercentage: slipOnLiquidity,
    netOutput: netOutput,
    isHalted: isHalted
  }
  return SwapEstimate
}


export const checkChainStatus = (sourceAsset: Asset): Boolean => {
  const midgardApi = new Midgard() // until midgard is built
  if(sourceAsset == AssetRuneNative){
    return true;
  }else{
    const data = await midgardApi.getProxiedInboundAddresses()
    const isHalted = data.find(e => e.chain == sourceAsset.chain)
    return isHalted?.halted!
  }
}


// export const doSwap = (sourceAsset: Asset, inputAmount: BaseAmount, destinationAsset: Asset, affiliateFee: BigNumber, slipLimit: BigNumber): SwapOutputData => {
//   // perform swap
//   // const txid = await
//   // const wait = estimate wait time.
//   const SwapOutputData = {
//     transactionId: txid,
//     expectedWait: wait
//   }

//   return SwapOutputData
// }


// export const getChainAsset = (chain: Chain): Asset => {
//   switch (chain) {
//     case BNBChain:
//       return AssetBNB
//     case BTCChain:
//       return AssetBTC
//     case ETHChain:
//       return AssetETH
//     case THORChain:
//       return AssetRuneNative
//     case CosmosChain:
//       throw Error('Cosmos is not supported yet')
//     case BCHChain:
//       return AssetBCH
//     case LTCChain:
//       return AssetLTC
//     case DOGEChain:
//       return AssetDOGE
//     case TerraChain:
//       throw Error(`Terra no longer exists`)
//     case PolkadotChain:
//       throw Error('Polkadot is not supported yet')
//   }
// }
