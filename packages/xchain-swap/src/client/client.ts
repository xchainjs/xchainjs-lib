import { SwapOutputData } from './client';
import { BigNumber } from 'bignumber.js';
import { Asset, BaseAmount } from "@xchainjs/xchain-util";
import { getSingleSwap } from "../utils";




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


export const prepareSwap = (sourceAsset: Asset, inputAmount: BaseAmount, destinationAsset: Asset, affiliateFee: BigNumber, slipLimit: BigNumber ): SwapEstimate => {
  //const PoolData1 = midgard(sourceAsset)// not yet implemented
  //const PoolData2 = midgard(destinationAsset)// not yet implemented
  const isHalted = checkStatus(sourceAsset)// only for those chains that are not Thor.
  const isDoubleSwap = sourceAsset.symbol != "RUNE" // if source and destination != rune then its a double swap.
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


export const checkStatus = (sourceAsset: Asset): Boolean => {
  const midgardApi = new Midgard({ network: "mainnet"}) // until midgard is built
  if( sourceAsset.symbol === "RUNE"){
    return true
  }else{
    const halted = (await midgardApi.getInboundDataByChain(`${sourceAsset.symbol}`)).halted
    return halted
  }
}


export const doSwap = (sourceAsset: Asset, inputAmount: BaseAmount, destinationAsset: Asset, affiliateFee: BigNumber, slipLimit: BigNumber): SwapOutputData => {
  // perform swap
  // const txid = await
  // const wait = estimate wait time.
  const SwapOutputData = {
    transactionId: txid,
    expectedWait: wait
  }

  return SwapOutputData
}
