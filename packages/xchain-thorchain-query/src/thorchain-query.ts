import { LastBlock, ObservedTx, ObservedTxStatusEnum, TxOutItem } from '@xchainjs/xchain-thornode'
import {
  Asset,
  AssetAtom,
  AssetBNB,
  AssetBTC,
  AssetRuneNative,
  Chain,
  THORChain,
  assetAmount,
  assetFromString,
  assetToBase,
  assetToString,
  baseAmount,
  eqAsset,
  isAssetRuneNative,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { DefaultChainAttributes } from './chain-defaults'
import { CryptoAmount } from './crypto-amount'
import { ThorchainCache } from './thorchain-cache'
import {
  AddliquidityPosition,
  Block,
  ChainAttributes,
  ConstructMemo,
  DustValues,
  EstimateAddLP,
  EstimateSwapParams,
  EstimateWithdrawLP,
  InboundDetail,
  LiquidityPosition,
  PoolRatios,
  PostionDepositValue,
  RemoveLiquidityPosition,
  SwapEstimate,
  TotalFees,
  TxDetails,
  TxStage,
  TxStatus,
  UnitData,
} from './types'
import { getLiquidityProtectionData, getLiquidityUnits, getPoolShare, getSlipOnLiquidity } from './utils/liquidity'
import { calcNetworkFee, getChain, getChainAsset } from './utils/swap'

const BN_1 = new BigNumber(1)

/**
 * THORChain Class for interacting with THORChain.
 * Recommended main class to use for swapping with THORChain
 * Has access to Midgard and THORNode data
 */
export class ThorchainQuery {
  readonly thorchainCache: ThorchainCache
  private chainAttributes: Record<Chain, ChainAttributes>

  /**
   * Contructor to create a ThorchainAMM
   *
   * @param thorchainCache - an instance of the ThorchainCache (could be pointing to stagenet,testnet,mainnet)
   * @param chainAttributes - atrributes used to calculate waitTime & conf counting
   * @returns ThorchainAMM
   */
  constructor(thorchainCache: ThorchainCache, chainAttributes = DefaultChainAttributes) {
    this.thorchainCache = thorchainCache
    this.chainAttributes = chainAttributes
  }

  /**
   * Provides a swap estimate for the given swap detail. Will check the params for errors before trying to get the estimate.
   * Uses current pool data, works out inbound and outboud fee, affiliate fees and works out the expected wait time for the swap (in and out)
   *
   * @param params - amount to swap

   * @returns The SwapEstimate
   */
  public async estimateSwap({
    input,
    destinationAsset,
    destinationAddress,
    affiliateAddress = '',
    interfaceID = 999,
    affiliateFeePercent = 0,
    slipLimit,
  }: EstimateSwapParams): Promise<TxDetails> {
    this.isValidSwap({
      input,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      interfaceID,
      affiliateFeePercent,
      slipLimit,
    })

    const inboundDetails = await this.thorchainCache.getInboundDetails()

    const sourceInboundDetails = inboundDetails[input.asset.chain]
    const destinationInboundDetails = inboundDetails[destinationAsset.chain]

    const swapEstimate = await this.calcSwapEstimate(
      {
        input,
        destinationAsset,
        destinationAddress,
        affiliateAddress,
        interfaceID,
        affiliateFeePercent,
        slipLimit,
      },
      sourceInboundDetails,
      destinationInboundDetails,
    )

    // Remove any affiliateFee. netInput * affiliateFee (%age) of the destination asset type
    const affiliateFee = input.baseAmount.times(affiliateFeePercent || 0)

    // Calculate expiry time
    const currentDatetime = new Date()
    const minutesToAdd = 15
    const expiryDatetime = new Date(currentDatetime.getTime() + minutesToAdd * 60000)

    // Check for errors
    const errors = await this.getSwapEstimateErrors(
      {
        input,
        destinationAsset,
        destinationAddress,
        affiliateAddress,
        interfaceID,
        affiliateFeePercent,
        slipLimit,
      },
      swapEstimate,
      sourceInboundDetails,
      destinationInboundDetails,
    )
    const txDetails: TxDetails = {
      memo: '',
      toAddress: '',
      expiry: expiryDatetime,
      txEstimate: swapEstimate,
    }
    if (errors.length > 0) {
      txDetails.txEstimate.canSwap = false
      txDetails.txEstimate.errors = errors
    } else {
      txDetails.txEstimate.canSwap = true
      // Retrieve inbound Asgard address.
      const inboundAsgard = (await this.thorchainCache.getInboundAddresses())[input.asset.chain]
      txDetails.toAddress = inboundAsgard?.address || ''
      // Work out LIM from the slip percentage
      let limPercentage = BN_1
      if (slipLimit) {
        limPercentage = BN_1.minus(slipLimit || 1)
      } // else allowed slip is 100%
      const limAssetAmount = swapEstimate.netOutput.times(limPercentage)

      const inboundDelay = await this.confCounting(input)
      const outboundDelay = await this.outboundDelay(limAssetAmount)
      txDetails.txEstimate.waitTimeSeconds = outboundDelay + inboundDelay

      // Construct memo
      txDetails.memo = this.constructSwapMemo({
        input: input,
        destinationAsset: destinationAsset,
        limit: limAssetAmount.baseAmount,
        destinationAddress: destinationAddress,
        affiliateAddress: affiliateAddress,
        affiliateFee,
        interfaceID: interfaceID,
      })
    }

    return txDetails
  }
  /**
   * Basic Checks for swap information
   * @param params
   */
  private isValidSwap(params: EstimateSwapParams) {
    // TODO validate all input fields

    if (eqAsset(params.input.asset, params.destinationAsset))
      throw Error(`sourceAsset and destinationAsset cannot be the same`)

    if (params.input.baseAmount.lte(0)) throw Error('inputAmount must be greater than 0')

    if (params.affiliateFeePercent && (params.affiliateFeePercent < 0 || params.affiliateFeePercent > 0.1))
      throw Error(`affiliateFee must be between 0 and 1000`)
  }
  /**
   * Does the calculations for the swap.
   * Used by estimateSwap
   *
   * @param params
   * @param sourceInboundDetails
   * @param destinationInboundDetails
   * @param sourcePool
   * @param destinationPool
   * @returns
   */
  private async calcSwapEstimate(
    params: EstimateSwapParams,
    sourceInboundDetails: InboundDetail,
    destinationInboundDetails: InboundDetail,
  ): Promise<SwapEstimate> {
    // NOTE need to convert the asset to 8 decimals places for all calcs
    const DEFAULT_THORCHAIN_DECIMALS = 8
    // If input is already in 8 decimals skip the convert
    const input =
      params.input.baseAmount.decimal === DEFAULT_THORCHAIN_DECIMALS
        ? params.input
        : await this.thorchainCache.convert(params.input, params.input.asset)

    // If asset is already rune native, skip the convert
    const inputInRune =
      input.asset === AssetRuneNative ? input : await this.thorchainCache.convert(input, AssetRuneNative)

    const inboundFeeInAsset = calcNetworkFee(input.asset, sourceInboundDetails)
    // Retrieve outbound fee from inboundAddressDetails.
    const outboundFeeInAsset = new CryptoAmount(
      baseAmount(destinationInboundDetails.outboundFee),
      params.destinationAsset,
    )
    // convert fees to rune
    const inboundFeeInRune = await this.thorchainCache.convert(inboundFeeInAsset, AssetRuneNative)
    let outboundFeeInRune = await this.thorchainCache.convert(outboundFeeInAsset, AssetRuneNative)

    // ---------- Remove Fees from inbound before doing the swap -----------
    // TODO confirm with chris about this change, was there a reason why this was commented out?
    const inputMinusInboundFeeInRune = inputInRune.minus(inboundFeeInRune)
    //>//const inputMinusInboundFeeInRune = inputInRune

    // remove any affiliateFee. netInput * affiliateFee (%age) of the destination asset type
    const affiliateFeeInRune = inputMinusInboundFeeInRune.times(params.affiliateFeePercent || 0)
    // remove the affiliate fee from the input.
    const inputNetAmountInRune = inputMinusInboundFeeInRune.minus(affiliateFeeInRune)
    // convert back to input asset
    const inputNetInAsset = await this.thorchainCache.convert(inputNetAmountInRune, input.asset)

    // Check outbound fee is equal too or greater than 1 USD * need to find a more permanent solution to this. referencing just 1 stable coin pool has problems
    if (params.destinationAsset.chain !== Chain.THORChain && !params.destinationAsset.synth) {
      const deepestUSDPOOL = await this.thorchainCache.getDeepestUSDPool()
      const usdAsset = deepestUSDPOOL.asset

      const networkValues = await this.thorchainCache.midgard.getNetworkValues()
      const usdMinFee = new CryptoAmount(baseAmount(networkValues['MINIMUML1OUTBOUNDFEEUSD']), usdAsset)
      // const FeeInUSD = await this.convert(outboundFeeInRune, usdAsset)
      const checkOutboundFee = (await this.convert(outboundFeeInRune, usdAsset)).gte(usdMinFee)
      if (!checkOutboundFee) {
        const newFee = usdMinFee
        outboundFeeInRune = await this.convert(newFee, AssetRuneNative)
      }
    }

    // Now calculate swap output based on inputNetAmount
    const swapOutput = await this.thorchainCache.getExpectedSwapOutput(inputNetInAsset, params.destinationAsset)
    const swapFeeInRune = await this.thorchainCache.convert(swapOutput.swapFee, AssetRuneNative)
    const outputInRune = await this.thorchainCache.convert(swapOutput.output, AssetRuneNative)

    // ---------------- Remove Outbound Fee ---------------------- /
    const netOutputInRune = outputInRune.minus(outboundFeeInRune)
    const netOutputInAsset = await this.thorchainCache.convert(netOutputInRune, params.destinationAsset)
    const totalFees: TotalFees = {
      inboundFee: inboundFeeInRune,
      swapFee: swapFeeInRune,
      outboundFee: outboundFeeInRune,
      affiliateFee: affiliateFeeInRune,
    }
    const swapEstimate = {
      totalFees: totalFees,
      slipPercentage: swapOutput.slip,
      netOutput: netOutputInAsset,
      waitTimeSeconds: 0, // will be set within EstimateSwap if canSwap = true
      canSwap: false, // assume false for now, the getSwapEstimateErrors() step will flip this flag if required
      errors: [],
    }
    return swapEstimate
  }

  /**
   *
   * @param params - swap object
   * @returns - constructed memo string
   */
  private constructSwapMemo(params: ConstructMemo): string {
    const limstring = params.limit.amount().toFixed()

    // create LIM with interface ID
    const lim = limstring.substring(0, limstring.length - 3).concat(params.interfaceID.toString())
    // create the full memo
    let memo = `=:${assetToString(params.destinationAsset)}`

    if (params.affiliateAddress != '' || params.affiliateFee == undefined) {
      memo = memo.concat(
        `:${params.destinationAddress}:${lim}:${params.affiliateAddress}:${params.affiliateFee.amount().toFixed()}`,
      )
    } else {
      memo = memo.concat(`:${params.destinationAddress}:${lim}`)
    }

    // If memo length is too long for BTC, trim it
    if (eqAsset(params.input.asset, AssetBTC) && memo.length > 80) {
      memo = `=:${assetToString(params.destinationAsset)}:${params.destinationAddress}`
    }
    return memo
  }

  /**
   * Looks for errors or issues within swap prams before doing the swap.
   *
   *
   * @param params
   * @param estimate
   * @param sourcePool
   * @param sourceInboundDetails
   * @param destinationPool
   * @param destinationInboundDetails
   * @returns
   */
  private async getSwapEstimateErrors(
    params: EstimateSwapParams,
    estimate: SwapEstimate,
    sourceInboundDetails: InboundDetail,
    destinationInboundDetails: InboundDetail,
  ): Promise<string[]> {
    const errors: string[] = []
    const sourceAsset = params.input.asset
    const destAsset = params.destinationAsset

    if (!isAssetRuneNative(sourceAsset)) {
      const sourcePool = await this.thorchainCache.getPoolForAsset(sourceAsset)
      if (!sourcePool.isAvailable())
        errors.push(`sourceAsset ${sourceAsset.ticker} does not have a valid liquidity pool`)
    }
    if (!isAssetRuneNative(destAsset)) {
      const destPool = await this.thorchainCache.getPoolForAsset(destAsset)
      if (!destPool.isAvailable())
        errors.push(`destinationAsset ${destAsset.ticker} does not have a valid liquidity pool`)
    }
    if (sourceInboundDetails.haltedChain) errors.push(`source chain is halted`)
    if (sourceInboundDetails.haltedTrading) errors.push(`source pool is halted trading`)
    if (destinationInboundDetails.haltedChain) errors.push(`destination chain is halted`)
    if (destinationInboundDetails.haltedTrading) errors.push(`destination pool is halted trading`)
    if (estimate.slipPercentage.gte(params.slipLimit || 1))
      errors.push(
        `expected slip: ${estimate.slipPercentage.toFixed()} is greater than your slip limit:${params.slipLimit?.toFixed()} `,
      )
    // only proceed to check fees if there are no errors so far
    if (errors.length > 0) return errors
    // Check if the inputAmount value is enough to cover all the fees.
    const canCoverFeesError = await this.checkCoverFees(params, estimate)
    if (canCoverFeesError) errors.push(canCoverFeesError)

    return errors
  }

  /**
   *
   * @param params
   * @param estimate
   * @returns
   */
  private async checkCoverFees(params: EstimateSwapParams, estimate: SwapEstimate): Promise<string | undefined> {
    let result: string | undefined = undefined
    const inputInRune = await this.thorchainCache.convert(params.input, AssetRuneNative)
    const feesInRune = await this.getFeesIn(estimate.totalFees, AssetRuneNative)

    const totalSwapFeesInRune = feesInRune.inboundFee
      .plus(feesInRune.outboundFee)
      .plus(feesInRune.swapFee)
      .plus(feesInRune.affiliateFee)
    const totalSwapFeesInAsset = await this.thorchainCache.convert(totalSwapFeesInRune, params.input.asset)
    if (totalSwapFeesInRune.gte(inputInRune))
      result = `Input amount ${params.input.formatedAssetString()}(${inputInRune.formatedAssetString()}) is less than or equal to total swap fees ${totalSwapFeesInAsset.formatedAssetString()}(${totalSwapFeesInRune.formatedAssetString()}) `
    return result
  }
  /**
   * Convenience method to convert TotalFees to a different CryptoAmount
   *
   * TotalFees are always calculated and returned in RUNE, this method can
   * be used to show the equivalent fees in another Asset Type
   *
   * @param fees: TotalFees - the fees you want to convert
   * @param asset: Asset - the asset you want the fees converted to
   * @returns TotalFees in asset
   */
  async getFeesIn(fees: TotalFees, asset: Asset): Promise<TotalFees> {
    return {
      inboundFee: await this.convert(fees.inboundFee, asset),
      swapFee: await this.convert(fees.swapFee, asset),
      outboundFee: await this.convert(fees.outboundFee, asset),
      affiliateFee: await this.convert(fees.affiliateFee, asset),
    }
  }
  /**
   * Returns the exchange of a CryptoAmount to a different Asset
   *
   * Ex. convert(input:100 BUSD, outAsset: BTC) -> 0.0001234 BTC
   *
   * @param input - amount/asset to convert to outAsset
   * @param ouAsset - the Asset you want to convert to
   * @returns CryptoAmount of input
   */
  async convert(input: CryptoAmount, outAsset: Asset): Promise<CryptoAmount> {
    return await this.thorchainCache.convert(input, outAsset)
  }
  /**
   * Finds the required confCount required for an inbound or outbound Tx to THORChain. Estimate based on Midgard data only.
   *
   * Finds the gas asset of the given asset (e.g. BUSD is on BNB), finds the value of asset in Gas Asset then finds the required confirmation count.
   * ConfCount is then times by 6 seconds.
   *
   * @param inbound: CryptoAmount - amount/asset of the outbound amount.
   * @returns time in seconds before a Tx is confirmed by THORChain
   * @see https://docs.thorchain.org/chain-clients/overview
   */
  async confCounting(inbound: CryptoAmount): Promise<number> {
    // RUNE, BNB and Synths have near instant finality, so no conf counting required. - need to make a BFT only case.
    if (
      isAssetRuneNative(inbound.asset) ||
      inbound.asset.chain == AssetBNB.chain ||
      inbound.asset.chain == AssetAtom.chain ||
      inbound.asset.synth
    ) {
      return this.chainAttributes[Chain.THORChain].avgBlockTimeInSecs
    }
    // Get the gas asset for the inbound.asset.chain
    const chainGasAsset = getChainAsset(inbound.asset.chain)

    // check for chain asset, else need to convert asset value to chain asset.
    const amountInGasAsset = await this.thorchainCache.convert(inbound, chainGasAsset)
    // Convert to Asset Amount
    const amountInGasAssetInAsset = amountInGasAsset.assetAmount

    const confConfig = this.chainAttributes[inbound.asset.chain]
    // find the required confs
    const requiredConfs = Math.ceil(amountInGasAssetInAsset.amount().div(confConfig.blockReward).toNumber())
    // convert that into seconds
    return requiredConfs * confConfig.avgBlockTimeInSecs
  }
  /**
   * Works out how long an outbound Tx will be held by THORChain before sending.
   *
   * @param outboundAmount: CryptoAmount  being sent.
   * @returns required delay in seconds
   * @see https://gitlab.com/thorchain/thornode/-/blob/develop/x/thorchain/manager_txout_current.go#L548
   */
  async outboundDelay(outboundAmount: CryptoAmount): Promise<number> {
    const networkValues = await this.thorchainCache.getNetworkValues()
    const minTxOutVolumeThreshold = new CryptoAmount(
      baseAmount(networkValues['MINTXOUTVOLUMETHRESHOLD']),
      AssetRuneNative,
    )
    const maxTxOutOffset = networkValues['MAXTXOUTOFFSET']
    let txOutDelayRate = new CryptoAmount(baseAmount(networkValues['TXOUTDELAYRATE']), AssetRuneNative).assetAmount
      .amount()
      .toNumber()
    const getScheduledOutboundValue = await this.thorchainCache.midgard.getScheduledOutboundValue()
    const thorChainblocktime = this.chainAttributes[Chain.THORChain].avgBlockTimeInSecs // blocks required to confirm tx
    // If asset is equal to Rune set runeValue as outbound amount else set it to the asset's value in rune
    const runeValue = await this.thorchainCache.convert(outboundAmount, AssetRuneNative)
    // Check rune value amount
    if (runeValue.lt(minTxOutVolumeThreshold)) {
      return thorChainblocktime
    }
    // Rune value in the outbound queue
    if (getScheduledOutboundValue == undefined) {
      throw new Error(`Could not return Scheduled Outbound Value`)
    }
    // Add OutboundAmount in rune to the oubound queue
    const outboundAmountTotal = runeValue.plus(getScheduledOutboundValue)
    // calculate the if outboundAmountTotal is over the volume threshold
    const volumeThreshold = outboundAmountTotal.div(minTxOutVolumeThreshold)
    // check delay rate
    txOutDelayRate = txOutDelayRate - volumeThreshold.assetAmount.amount().toNumber() <= 1 ? 1 : txOutDelayRate
    // calculate the minimum number of blocks in the future the txn has to be
    let minBlocks = runeValue.assetAmount.amount().toNumber() / txOutDelayRate
    minBlocks = minBlocks > maxTxOutOffset ? maxTxOutOffset : minBlocks
    return minBlocks * thorChainblocktime
  }

  /**
   * For a given in Tx Hash (as returned by THORChainAMM.DoSwap()), finds the status of any THORChain transaction
   * This function should be polled.
   * @param
   * @param inboundTxHash - needed to determine transactions stage
   * @param sourceChain - extra parameter
   * @returns - object tx status
   */
  public async checkTx(inboundTxHash: string, sourceChain?: Chain): Promise<TxStatus> {
    let txStatus: TxStatus = { stage: TxStage.INBOUND_CHAIN_UNCONFIRMED, seconds: 0 }
    const txData = await this.thorchainCache.thornode.getTxData(inboundTxHash)
    const scheduledQueueItem = (await this.thorchainCache.thornode.getscheduledQueue()).find(
      (item: TxOutItem) => item.in_hash === inboundTxHash,
    )
    //console.log(`Tx stage ${txStatus.stage}\nTx seconds left ${txStatus.seconds}`)
    // Check to see if the transaction has been observed
    if (txData.observed_tx == undefined) {
      txStatus = await this.checkTxDefined(txStatus, sourceChain)
      return txStatus
    }
    // If its scheduled and observed
    if (scheduledQueueItem && txData.observed_tx) {
      txStatus = await this.checkObservedOnly(txStatus, scheduledQueueItem, txData.observed_tx, sourceChain)
    }
    //console.log(`Tx stage ${txStatus.stage}\nTx seconds left ${txStatus.seconds}`)

    // Retrieve asset and chain from memo
    const pool = txData.observed_tx.tx.memo?.split(`:`)
    if (!pool) throw Error(`No pool found from memo`)
    const getAsset = assetFromString(pool[1].toUpperCase())
    if (!getAsset) throw Error(`Invalid pool asset`)

    // Retrieve thorchain blockHeight for the tx
    if (!txData.observed_tx.tx?.id) throw Error('No action observed')
    const recordedAction = await this.thorchainCache.midgard.getActions('', txData.observed_tx.tx.id)
    const recordedTCBlock = recordedAction.find((block) => {
      return block
    })
    if (!recordedTCBlock?.height) throw Error('No recorded block height')

    // Retrieve thorchains last observed block height
    const lastBlock = await this.thorchainCache.thornode.getLastBlock()
    const lastBlockHeight = lastBlock.find((obj) => obj.chain === getAsset?.chain)

    // Check to see if its in the outbound queue
    if (scheduledQueueItem) {
      txStatus = await this.checkOutboundQueue(txStatus, scheduledQueueItem, lastBlockHeight)
      // Check to see if there is an outbound wait
      if (scheduledQueueItem?.height != undefined && txStatus.stage < TxStage.OUTBOUND_CHAIN_CONFIRMED) {
        txStatus = await this.checkOutboundTx(txStatus, scheduledQueueItem, lastBlockHeight)
      }
      //console.log(`Tx stage ${txStatus.stage}\nTx seconds left ${txStatus.seconds}`)
      return txStatus
    }

    // If not in queue, outbound Tx sent // check synth // check it status == done
    if (!scheduledQueueItem && getAsset) {
      txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
      if (getAsset?.synth) {
        if (txData.observed_tx?.status == ObservedTxStatusEnum.Done) {
          txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
          txStatus.seconds = 0
        } else {
          txStatus.seconds = 6
        }
        //console.log(`Tx stage ${txStatus.stage}\nTx seconds left ${txStatus.seconds}`)
        return txStatus
      }
      if (txData.observed_tx?.status == ObservedTxStatusEnum.Done && getAsset.chain != Chain.THORChain) {
        // Retrieve recorded asset block height for the Outbound asset
        const recordedBlockHeight = await this.thorchainCache.thornode.getLastBlock(+recordedTCBlock.height)
        // Match outbound asset to block record
        const assetBlockHeight = recordedBlockHeight.find((obj) => obj.chain === getAsset?.chain)
        if (lastBlockHeight?.last_observed_in && assetBlockHeight?.last_observed_in) {
          const chainblockTime = this.chainAttributes[getAsset.chain].avgBlockTimeInSecs
          // Difference between current block and the recorded tx block for the outbound asset
          const blockDifference = lastBlockHeight.last_observed_in - assetBlockHeight.last_observed_in
          const timeElapsed = blockDifference * chainblockTime
          // If the time elapsed since the tx is greater than the chains block time, assume tx has 1 ocnfirmation else return time left to wait
          txStatus.seconds = timeElapsed > chainblockTime ? 0 : chainblockTime - timeElapsed
          console.log(timeElapsed)
        } else if (txData.observed_tx.tx.id && lastBlockHeight?.thorchain) {
          const recordedAction = await this.thorchainCache.midgard.getActions(txData.observed_tx.tx.id)
          const recordedBlockheight = recordedAction.find((block) => {
            return block
          })
          if (!recordedBlockheight) throw Error(`No height recorded`)
          const chainblockTime = this.chainAttributes[getAsset.chain].avgBlockTimeInSecs
          console.log(chainblockTime)
          const blockDifference = lastBlockHeight?.thorchain - +recordedBlockheight.height
          console.log(blockDifference)
          const timeElapsed =
            (blockDifference * chainblockTime) / this.chainAttributes[getAsset.chain].avgBlockTimeInSecs
          txStatus.seconds = timeElapsed > chainblockTime ? 0 : chainblockTime - timeElapsed
          console.log(txStatus.seconds)
          txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
        }
        //console.log(`Tx stage ${txStatus.stage}\nTx seconds left ${txStatus.seconds}`)
        return txStatus
      } else {
        txStatus.seconds = 0
        txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
      }
      //console.log(`Tx stage ${txStatus.stage}\nTx seconds left ${txStatus.seconds}`)
      return txStatus
    } else {
      // case example "memo": "OUT:08BC062B248F6F27D0FECEF1650843585A1496BFFEAF7CB17A1CBC30D8D58F9C" where no asset is found its a thorchain tx. Confirms in ~6 seconds
      txStatus.seconds = 0
      txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
    }
    return txStatus
  }

  /** Stage 1  */
  private async checkTxDefined(txStatus: TxStatus, sourceChain?: Chain): Promise<TxStatus> {
    // If there is an error Thornode does not know about it. wait 60 seconds
    // If a long block time like BTC, can check or poll to see if the status changes.
    if (sourceChain) {
      txStatus.seconds = this.chainAttributes[sourceChain].avgBlockTimeInSecs
    } else {
      txStatus.seconds = 60
    }
    return txStatus
  }

  /** Stage 2, THORNode has seen it. See if observed only (conf counting) or it has been processed by THORChain  */
  // e.g. https://thornode.ninerealms.com/thorchain/tx/365AC447BE6CE4A55D14143975EE3823A93A0D8DE2B70AECDD63B6A905C3D72B
  private async checkObservedOnly(
    txStatus: TxStatus,
    scheduledQueueItem: TxOutItem,
    observed_tx?: ObservedTx,
    sourceChain?: Chain,
  ): Promise<TxStatus> {
    if (observed_tx?.tx?.chain != undefined) {
      sourceChain = getChain(observed_tx.tx.chain)
    } else {
      throw new Error(`Cannot get source chain ${observed_tx?.tx?.chain}`)
    }

    //If observed by not final, need to wait till the finalised block before moving to the next stage, blocks in source chain
    if (observed_tx?.block_height && observed_tx?.finalise_height && scheduledQueueItem.height) {
      if (observed_tx.block_height < observed_tx.finalise_height) {
        txStatus.stage = TxStage.CONF_COUNTING
        const blocksToWait = observed_tx.finalise_height - scheduledQueueItem.height
        txStatus.seconds = blocksToWait * this.chainAttributes[sourceChain].avgBlockTimeInSecs
      } else if (observed_tx.status != ObservedTxStatusEnum.Done) {
        // processed but not yet full final, e.g. not 2/3 nodes signed
        txStatus.seconds = this.chainAttributes[THORChain].avgBlockTimeInSecs // wait one more TC block
        txStatus.stage = TxStage.TC_PROCESSING
      }
    }
    return txStatus
  }
  /**
   * Stage 3
   * @param txStatus
   * @param txData
   * @param scheduledQueue
   * @param scheduledQueueItem
   * @param lastBlockHeight
   * @returns
   */
  private async checkOutboundQueue(
    txStatus: TxStatus,
    scheduledQueueItem?: TxOutItem,
    lastBlockHeight?: LastBlock,
  ): Promise<TxStatus> {
    // If the scheduled block is greater than the current block, need to wait that amount of blocks till outbound is sent
    if (scheduledQueueItem?.height && lastBlockHeight?.thorchain) {
      if (lastBlockHeight.thorchain < scheduledQueueItem?.height) {
        const blocksToWait = scheduledQueueItem.height - lastBlockHeight.thorchain
        txStatus.stage = TxStage.OUTBOUND_QUEUED
        txStatus.seconds = blocksToWait * this.chainAttributes[THORChain].avgBlockTimeInSecs
        return txStatus
      } else {
        txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
        return txStatus
      }
    }
    return txStatus
  }
  /** Stage 4 */
  private async checkOutboundTx(
    txStatus: TxStatus,
    scheduledQueueItem?: TxOutItem,
    lastBlockHeight?: LastBlock,
  ): Promise<TxStatus> {
    if (scheduledQueueItem?.height && lastBlockHeight?.thorchain) {
      const blockDifference = scheduledQueueItem.height - lastBlockHeight?.thorchain
      const timeElapsed = blockDifference * this.chainAttributes[THORChain].avgBlockTimeInSecs
      if (blockDifference == 0) {
        // If Tx has just been sent, Stage 3 should pick this up really
        txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
        txStatus.seconds = this.chainAttributes[THORChain].avgBlockTimeInSecs
      } else if (timeElapsed < txStatus.seconds) {
        // if the time passed since the outbound TX was sent is less than the outbound block time, outbound Tx unconfirmed, wait a bit longer.
        txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
        txStatus.seconds = this.chainAttributes[THORChain].avgBlockTimeInSecs - timeElapsed // workout how long to wait
      } else {
        // time passed is greater than outbound Tx time, Tx is confirmed. Thus stage 5
        txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
        txStatus.seconds = 0
      }
    }
    return txStatus
  }

  /**
   * Estimates a liquidity position for given crypto amount value, both asymmetrical and symetrical
   * @param params - parameters needed for a estimated liquidity position
   * @returns - type object EstimateLP
   */
  public async estimateAddLP(params: AddliquidityPosition): Promise<EstimateAddLP> {
    const errors: string[] = []
    if (params.asset.asset.synth || params.rune.asset.synth) errors.push('you cannot add liquidity with a synth')
    if (!isAssetRuneNative(params.rune.asset)) errors.push('params.rune must be THOR.RUNE')

    const assetPool = await this.thorchainCache.getPoolForAsset(params.asset.asset)
    const lpUnits = getLiquidityUnits({ asset: params.asset, rune: params.rune }, assetPool)
    const inboundDetails = await this.thorchainCache.getInboundDetails()
    const unitData: UnitData = {
      liquidityUnits: lpUnits,
      totalUnits: new BigNumber(assetPool.pool.liquidityUnits),
    }
    const poolShare = getPoolShare(unitData, assetPool)
    const assetWaitTimeSeconds = await this.confCounting(params.asset)
    const runeWaitTimeSeconds = await this.confCounting(params.rune)
    const waitTimeSeconds = assetWaitTimeSeconds > runeWaitTimeSeconds ? assetWaitTimeSeconds : runeWaitTimeSeconds

    let assetInboundFee = new CryptoAmount(baseAmount(0), params.asset.asset)
    let runeInboundFee = new CryptoAmount(baseAmount(0), AssetRuneNative)

    if (!params.asset.assetAmount.eq(0)) {
      assetInboundFee = calcNetworkFee(params.asset.asset, inboundDetails[params.asset.asset.chain])
      if (assetInboundFee.assetAmount.amount().times(3).gt(params.asset.assetAmount.amount()))
        errors.push(`Asset amount is less than fees`)
    }
    if (!params.rune.assetAmount.eq(0)) {
      runeInboundFee = calcNetworkFee(params.rune.asset, inboundDetails[params.rune.asset.chain])
      if (runeInboundFee.assetAmount.amount().times(3).gt(params.rune.assetAmount.amount()))
        errors.push(`Rune amount is less than fees`)
    }
    const totalFees = (await this.convert(assetInboundFee, AssetRuneNative)).plus(runeInboundFee)
    const slip = getSlipOnLiquidity({ asset: params.asset, rune: params.rune }, assetPool)
    const estimateLP: EstimateAddLP = {
      assetPool: assetPool.pool.asset,
      slipPercent: slip.times(100),
      poolShare: poolShare,
      lpUnits: baseAmount(lpUnits),
      runeToAssetRatio: assetPool.runeToAssetRatio,
      transactionFee: {
        assetFee: assetInboundFee,
        runeFee: runeInboundFee,
        totalFees: totalFees,
      },
      estimatedWaitSeconds: waitTimeSeconds,
      errors,
      canAdd: errors.length > 0 ? false : true,
    }
    return estimateLP
  }

  /**
   * @param - Asset for lp
   * @param address - address used for Lp
   * @returns - Type Object liquidityPosition
   */
  public async checkLiquidityPosition(asset: Asset, assetOrRuneAddress?: string): Promise<LiquidityPosition> {
    const poolAsset = await this.thorchainCache.getPoolForAsset(asset)
    if (!poolAsset) throw Error(`Could not find pool for ${asset}`)
    if (!assetOrRuneAddress) throw Error(`No address provided ${assetOrRuneAddress}`)

    const liquidityProvider = await this.thorchainCache.thornode.getLiquidityProvider(
      poolAsset.assetString,
      assetOrRuneAddress,
    )
    if (!liquidityProvider) throw Error(`Could not find LP for ${assetOrRuneAddress}`)
    // Current block number for that chain
    const blockData = (await this.thorchainCache.thornode.getLastBlock()).find((item) => item.chain === asset.chain)
    if (!blockData) throw Error(`Could not get block data`)
    // Pools total units & Lp's total units
    const unitData: UnitData = {
      totalUnits: new BigNumber(poolAsset.pool.liquidityUnits),
      liquidityUnits: new BigNumber(liquidityProvider.units),
    }
    //console.log(`unit data`, unitData.totalUnits.amount().toNumber(), unitData.liquidityUnits.amount().toNumber())
    const networkValues = await this.thorchainCache.midgard.getNetworkValues()
    const block: Block = {
      current: blockData.thorchain,
      lastAdded: liquidityProvider.last_add_height,
      fullProtection: networkValues['FULLIMPLOSSPROTECTIONBLOCKS'],
    }
    //
    const currentLP: PostionDepositValue = {
      asset: baseAmount(liquidityProvider.asset_deposit_value),
      rune: baseAmount(liquidityProvider.rune_deposit_value),
    }
    const poolShare = getPoolShare(unitData, poolAsset)
    // console.log(poolShare.assetShare.toNumber(), poolShare.runeShare.toNumber())
    // console.log(poolAsset.pool.liquidityUnits)
    const impermanentLossProtection = getLiquidityProtectionData(currentLP, poolShare, block)
    const lpPosition: LiquidityPosition = {
      poolShare,
      position: liquidityProvider,
      impermanentLossProtection: impermanentLossProtection,
    }
    return lpPosition
  }

  /**
   * Do not send assetNativeRune, There is no pool for it.
   * @param asset - asset required to find the pool
   * @returns - object type ratios
   */
  public async getPoolRatios(asset: Asset): Promise<PoolRatios> {
    const assetPool = await this.thorchainCache.getPoolForAsset(asset)
    const poolRatio: PoolRatios = {
      assetToRune: assetPool.assetToRuneRatio,
      runeToAsset: assetPool.runeToAssetRatio,
    }
    return poolRatio
  }

  /**
   *
   * @param params
   */
  public async estimateWithdrawLP(params: RemoveLiquidityPosition): Promise<EstimateWithdrawLP> {
    // Caution Dust Limits: BTC,BCH,LTC chains 10k sats; DOGE 1m Sats; ETH 0 wei; THOR 0 RUNE.
    const assetOrRuneAddress = params.assetAddress ? params.assetAddress : params.runeAddress
    const memberDetail = await this.checkLiquidityPosition(params.asset, assetOrRuneAddress)
    const dustValues = await this.getDustValues(params.asset) // returns asset and rune dust values
    const assetPool = await this.thorchainCache.getPoolForAsset(params.asset)
    // get pool share from unit data
    const poolShare = getPoolShare(
      {
        liquidityUnits: new BigNumber(memberDetail.position.units),
        totalUnits: new BigNumber(assetPool.pool.liquidityUnits),
      },
      assetPool,
    )
    // calculate total fees
    const totalFees = (await this.convert(dustValues.asset, AssetRuneNative)).plus(dustValues.rune)
    // get slip on liquidity removal
    const slip = getSlipOnLiquidity(
      {
        asset: poolShare.assetShare,
        rune: poolShare.runeShare,
      },
      assetPool,
    )
    // TODO make sure we compare wait times for withdrawing both rune and asset OR just rune OR just asset
    const waitTimeSecondsForAsset = await this.confCounting(poolShare.assetShare.div(params.percentage / 100))
    const waitTimeSecondsForRune = await this.confCounting(poolShare.runeShare.div(params.percentage / 100))
    let waitTimeSeconds = 0
    if (params.assetAddress && params.runeAddress) {
      waitTimeSeconds = waitTimeSecondsForAsset + waitTimeSecondsForRune
    } else if (params.assetAddress) {
      waitTimeSeconds = waitTimeSecondsForAsset
    } else {
      waitTimeSeconds = waitTimeSecondsForRune
    }
    const estimateLP: EstimateWithdrawLP = {
      assetAddress: memberDetail.position.asset_address,
      runeAddress: memberDetail.position.rune_address,
      slipPercent: slip.times(100),
      transactionFee: {
        assetFee: dustValues.asset,
        runeFee: dustValues.rune,
        totalFees: totalFees,
      },
      assetAmount: poolShare.assetShare,
      runeAmount: poolShare.runeShare,
      estimatedWaitSeconds: waitTimeSeconds,
      impermanentLossProtection: memberDetail.impermanentLossProtection,
      assetPool: assetPool.pool.asset,
    }
    return estimateLP
  }
  /**
   * // can this become a quried constant? added to inbound_addresses or something
   * @param asset - asset needed to retrieve dust values
   * @returns - object type dust values
   */
  private async getDustValues(asset: Asset): Promise<DustValues> {
    let dustValues: DustValues
    switch (asset.chain) {
      case 'BNB':
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0.000001)), AssetBNB),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      case 'BTC' || `BCH` || `LTC`:
        // 10k sats
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0.0001)), asset),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      case 'ETH':
        // 0 wei
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0)), asset),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      case 'THOR':
        // 0 Rune
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0)), asset),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      case 'GAIA':
        // 0 GAIA
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0)), asset),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      case 'DOGE':
        // 1 million sats
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0.01)), asset),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      default:
        throw Error('Unknown chain')
    }
  }
}
