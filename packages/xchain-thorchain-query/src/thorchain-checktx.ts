import { BTCChain } from '@xchainjs/xchain-bitcoin'
import { BCHChain } from '@xchainjs/xchain-bitcoincash'
import { LTCChain } from '@xchainjs/xchain-litecoin'
import { THORChain, isAssetRuneNative } from '@xchainjs/xchain-thorchain'
import {
  LastBlock,
  ObservedTx,
  Saver,
  TxDetailsResponse,
  TxOutItem,
  TxSignersResponse,
} from '@xchainjs/xchain-thornode'
import { Asset, Chain, assetFromStringEx, baseAmount } from '@xchainjs/xchain-util'

import { DefaultChainAttributes } from './chain-defaults'
import { CryptoAmount } from './crypto-amount'
import { ThorchainCache } from './thorchain-cache'
import { ChainAttributes, TransactionProgress, TransactionStatus } from './types'
import { getChain } from './utils/swap'

export enum TxType {
  Swap = 'Swap',
  AddLP = 'AddLP',
  WithdrawLP = 'WithdrawLP',
  AddSaver = 'AddSaver',
  WithdrawSaver = 'WithdrawSaver',
  Other = 'Other',
  Unknown = 'Unknown',
}
export enum InboundStatus {
  Observed_Consensus = 'Observed_Consensus',
  Observed_Incomplete = 'Observed_Incomplete',
  Unknown = 'Unknown',
}
export enum SwapStatus {
  Complete = 'Complete',
  Complete_Refunded = 'Complete_Refunded',
  Complete_Below_Dust = 'Complete_Below_Dust',
  Incomplete = 'Incomplete',
}
export enum AddLpStatus {
  Complete = 'Complete',
  Complete_Refunded = 'Complete_Refunded',
  Complete_Below_Dust = 'Complete_Below_Dust',
  Incomplete = 'Incomplete',
}
export enum WithdrawLpStatus {
  Complete = 'Complete',
  Incomplete = 'Incomplete',
}
export enum AddSaverStatus {
  Complete = 'Complete',
  Complete_Refunded = 'Complete_Refunded',
  Complete_Below_Dust = 'Complete_Below_Dust',
  Incomplete = 'Incomplete',
}
export type SwapInfo = {
  status: SwapStatus
  toAddress: string
  minimumAmountOut: CryptoAmount
  affliateFee: CryptoAmount
  expectedOutBlock: number
  expectedOutDate: Date
  expectedAmountOut: CryptoAmount
  actualAmountOut?: CryptoAmount
}
export type AddLpInfo = {
  status: AddLpStatus
  isSymmetric: boolean
  assetTx?: InboundTx
  runeTx?: InboundTx
  assetConfirmationDate?: Date
}
export type WithdrawLpInfo = {
  status: WithdrawLpStatus
  withdrawalAmount: CryptoAmount
  expectedConfirmationDate: Date
}
export type AddSaverInfo = {
  status: AddSaverStatus
  assetTx?: InboundTx
  saverPos?: Saver
}
type InboundTx = {
  status: InboundStatus
  date: Date
  block: number
  expectedConfirmationBlock: number
  expectedConfirmationDate: Date
  amount: CryptoAmount
  fromAddress: string
  memo: string
}
export type TXProgress = {
  txType: TxType
  inboundObserved?: InboundTx
  swapInfo?: SwapInfo
  addLpInfo?: AddLpInfo
  addSaverInfo?: AddSaverInfo
  withdrawLpInfo?: WithdrawLpInfo
}

export class TransactionStage {
  readonly thorchainCache: ThorchainCache
  private chainAttributes: Record<Chain, ChainAttributes>

  constructor(thorchainCache: ThorchainCache, chainAttributes = DefaultChainAttributes) {
    this.thorchainCache = thorchainCache
    this.chainAttributes = chainAttributes
  }
  public async checkTxProgress(inboundTxHash: string): Promise<TXProgress> {
    let txData
    try {
      if (inboundTxHash.length < 1) throw Error('inboundTxHash too short')
      txData = await this.thorchainCache.thornode.getTxDetail(inboundTxHash)
      // console.log(JSON.stringify(txData, null, 2))
    } catch (error) {
      return {
        txType: TxType.Unknown,
      }
    }
    //valid tx
    const progress = await this.determineObserved(txData)

    switch (progress.txType) {
      case TxType.Swap:
        await this.checkSwapProgress(txData, progress)
        break
      case TxType.AddLP:
        await this.checkAddLpProgress(txData, progress)
        break
      case TxType.WithdrawLP:
        await this.checkWithdrawLpProgress(txData, progress)
        break
      case TxType.AddSaver:
        await this.checkAddSaverProgress(txData, progress)
        break
      default:
        break
    }

    return progress
  }
  private async checkSwapProgress(txData: TxDetailsResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      const memo = txData.tx.tx.memo ?? ''
      const memoFields = this.parseSwapMemo(memo)
      const assetOut = assetFromStringEx(memoFields.asset)
      const minimumAmountOut = memoFields.limit
        ? await this.getCryptoAmount(memoFields.limit, assetOut)
        : await this.getCryptoAmount('0', assetOut)

      const affliateFee = memoFields.affiliateFee
        ? await this.getCryptoAmount(memoFields.affiliateFee, assetOut)
        : await this.getCryptoAmount('0', assetOut)
      // TODO get out tx
      // const outMemo = txData.tx.out_hashes ?? txData.out_txs
      const swapInfo: SwapInfo = {
        status: SwapStatus.Incomplete,
        expectedOutBlock: Number(`${progress.inboundObserved?.expectedConfirmationBlock}`),
        expectedOutDate: new Date(`${progress.inboundObserved?.expectedConfirmationDate}`),
        expectedAmountOut: minimumAmountOut, // TODO call estimateSwap()
        minimumAmountOut,
        affliateFee,
        toAddress: memoFields.destAddress,
      }
      progress.swapInfo = swapInfo
    }
  }
  private parseSwapMemo(memo: string) {
    //SWAP:ASSET:DESTADDR:LIM:AFFILIATE:FEE
    const parts = memo.split(`:`)
    const action = parts[0]
    const asset = parts[1]
    const destAddress = parts[2]
    const limit = parts.length > 3 && parts[3].length > 0 ? parts[3] : undefined
    const affiliateAddress = parts.length > 4 && parts[4].length > 0 ? parts[4] : undefined
    const affiliateFee = parts.length > 5 && parts[5].length > 0 ? parts[5] : undefined
    return { action, asset, destAddress, limit, affiliateAddress, affiliateFee }
  }
  private async getCryptoAmount(baseAmt: string, asset: Asset): Promise<CryptoAmount> {
    const decimals =
      THORChain === asset.chain ? 8 : Number((await this.thorchainCache.getPoolForAsset(asset)).pool.nativeDecimal)
    return new CryptoAmount(baseAmount(baseAmt, decimals), asset)
  }
  private async determineObserved(txData: TxSignersResponse): Promise<TXProgress> {
    const progress: TXProgress = {
      txType: TxType.Unknown,
    }

    if (txData.tx) {
      const memo = txData.tx.tx.memo ?? ''
      const parts = memo?.split(`:`)
      const operation = parts && parts[0] ? parts[0] : ''
      const assetIn = assetFromStringEx(txData.tx.tx.coins?.[0].asset)
      const inboundAmount = txData.tx.tx.coins?.[0].amount
      const fromAddress = txData.tx.tx.from_address ?? 'unknkown'
      const block = assetIn.chain == THORChain ? Number(txData.finalised_height) : Number(txData.tx.block_height)

      const finalizeBlock =
        assetIn.chain == THORChain ? Number(txData.finalised_height) : Number(txData.tx.finalise_height)
      const status = txData.tx.status === 'done' ? InboundStatus.Observed_Consensus : InboundStatus.Observed_Incomplete

      if (operation.match(/swap|s|=/gi)) progress.txType = TxType.Swap
      if ((operation.match(/add/gi) && parts[1].match(`/`)) || (operation.match(/a|[+]/) && parts[1].match(/[/]/)))
        progress.txType = TxType.AddSaver
      if ((operation.match(/add/gi) && parts[1].match(`.`)) || (operation.match(/a|[+]/) && parts[1].match(/[.]/)))
        progress.txType = TxType.AddLP
      if (operation.match(/withdraw|wd|-/gi) && parts[1].match(/[/]/)) progress.txType = TxType.WithdrawSaver
      if (operation.match(/withdraw|wd|-/gi) && parts[1].match(/[.]/)) progress.txType = TxType.WithdrawLP
      console.log(operation, progress.txType, parts[1])
      const amount = await this.getCryptoAmount(inboundAmount, assetIn)
      // find a date for when it should be competed
      const expectedConfirmationDate = await this.blockToDate(assetIn.chain, txData)

      progress.inboundObserved = {
        status,
        date: new Date(), // date observed?
        block,
        expectedConfirmationBlock: finalizeBlock,
        expectedConfirmationDate,
        amount,
        fromAddress,
        memo,
      }
    }
    return progress
  }

  private async checkAddLpProgress(txData: TxSignersResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      const memo = txData.tx.tx.memo ?? ''
      const memoFields = this.parseAddLpMemo(memo)
      const asset = assetFromStringEx(memoFields.asset)
      const isSymmetric = memoFields.pairedAddress ? true : false
      const assetTx = !isAssetRuneNative(progress.inboundObserved.amount.asset) ? progress.inboundObserved : undefined
      const runeTx = isAssetRuneNative(progress.inboundObserved.amount.asset) ? progress.inboundObserved : undefined
      const pairedAssetExpectedConfirmationDate = assetTx ? await this.blockToDate(asset.chain, txData) : undefined
      const checkLpPosition = await this.thorchainCache.thornode.getLiquidityProvider(
        memoFields.asset,
        progress.inboundObserved.fromAddress,
      )
      const status = checkLpPosition ? AddLpStatus.Complete : AddLpStatus.Incomplete
      const addLpInfo: AddLpInfo = {
        status,
        isSymmetric,
        assetTx,
        runeTx,
        assetConfirmationDate: pairedAssetExpectedConfirmationDate,
      }
      progress.addLpInfo = addLpInfo
    }
  }

  private async checkWithdrawLpProgress(txData: TxSignersResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      const memo = txData.tx.tx.memo ?? ''
      const memoFields = this.parseAddLpMemo(memo)
      const asset = assetFromStringEx(memoFields.asset)

      // find the date in which the asset should be seen in the wallet
      const expectedConfirmationDate = await this.blockToDate(asset.chain, txData)
      const outAmount = JSON.stringify(txData.out_txs).split(`"amount":"`)[1].split(`"`)
      const status =
        progress.inboundObserved.date > expectedConfirmationDate
          ? WithdrawLpStatus.Complete
          : WithdrawLpStatus.Incomplete
      const withdrawLpInfo: WithdrawLpInfo = {
        status,
        withdrawalAmount: new CryptoAmount(baseAmount(outAmount[0]), asset),
        expectedConfirmationDate,
      }
      progress.withdrawLpInfo = withdrawLpInfo
    }
  }

  private async checkAddSaverProgress(txData: TxSignersResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      const assetTx = !isAssetRuneNative(progress.inboundObserved.amount.asset) ? progress.inboundObserved : undefined

      const checkSaverVaults = await this.thorchainCache.thornode.getSaver(
        txData.tx.tx.coins[0].asset,
        `${assetTx?.fromAddress}`,
      )
      const status = checkSaverVaults ? AddSaverStatus.Complete : AddSaverStatus.Incomplete
      const addSaverInfo: AddSaverInfo = {
        status: status,
        assetTx,
        saverPos: checkSaverVaults,
      }
      progress.addSaverInfo = addSaverInfo
    }
  }
  private parseAddLpMemo(memo: string) {
    //ADD:POOL:PAIREDADDR:AFFILIATE:FEE
    const parts = memo.split(`:`)
    const action = parts[0]
    const asset = parts[1]
    //optional fields
    const pairedAddress = parts.length > 2 && parts[2].length > 0 ? parts[2] : undefined
    const affiliateAddress = parts.length > 3 && parts[3].length > 0 ? parts[3] : undefined
    const affiliateFee = parts.length > 4 && parts[4].length > 0 ? parts[4] : undefined
    return { action, asset, pairedAddress, affiliateAddress, affiliateFee }
  }
  /**
   * Private function to return the date stamp from block height and chain
   * @param chain - input chain
   * @param txData - txResponse
   * @returns date()
   */
  private async blockToDate(chain: Chain, txData: TxSignersResponse) {
    const lastBlockObj = await this.thorchainCache.thornode.getLastBlock()
    const time = new Date()
    const recordedBlock = Number(`${txData.tx.block_height}`)
    let blockDifference: number
    const currentHeight = lastBlockObj.find((obj) => obj.chain == chain)
    const chainHeight = Number(`${currentHeight?.last_observed_in}`)
    // find out how long ago it was processed
    if (chainHeight > recordedBlock) {
      blockDifference = chainHeight - recordedBlock
      time.setSeconds(time.getSeconds() - blockDifference * this.chainAttributes[chain].avgBlockTimeInSecs)
    } else if (chain == THORChain) {
      const currentHeight = lastBlockObj.find((obj) => obj)
      const thorchainHeight = Number(`${currentHeight?.thorchain}`) // current height of the TC
      const finalisedHeight = Number(`${txData.finalised_height}`) // height tx was completed in
      blockDifference = thorchainHeight - finalisedHeight
      time.setSeconds(time.getSeconds() - blockDifference * this.chainAttributes[chain].avgBlockTimeInSecs)
    } else {
      time.setSeconds(time.getSeconds() + this.chainAttributes[chain].avgBlockTimeInSecs / 2) // Assume block is half completed, therefore divide average block times by 2
    }
    return time
  }

  // Functions follow this logic below
  // 1. Has TC see it?
  // 2. If observed, is there inbound conf counting (for non BFT Chains)? If so, for how long
  // 3. Has TC processed it?
  // 4. Is it in the outbound queue? If so, what is the target block and how long will it take for that to happen?
  // 5. If TC has sent it, how long will outbound conf take?

  /**
   *
   * @param inboundTxHash - Input needed to determine the transaction stage
   * @param sourceChain - Needed for faster logic
   * @returns - tx stage or maybe a boolean not sure at this stage
   */
  public async checkTxProgressDraft(
    inboundTxHash: string,
    progress?: number,
    sourceChain?: Chain,
  ): Promise<TransactionProgress> {
    const transactionProgress: TransactionProgress = {
      progress: 0,
      seconds: 0,
      errors: [],
    }
    if (progress) {
      transactionProgress.progress = progress
    } else {
      progress = 0
    }

    const txData = await this.thorchainCache.thornode.getTxDetail(inboundTxHash)
    const isSynth = await this.isSynthTransaction(txData)
    if (isSynth) {
      progress = 3
    }
    const lastBlock = await this.thorchainCache.thornode.getLastBlock()
    if (txData.tx == undefined) {
      // Check inbound, if nothing check outbound queue
      progress = 2
    }
    console.log('mike')
    switch (progress) {
      case 0:
        const txObserved = await this.checkTCRecords(txData, sourceChain)
        transactionProgress.seconds = txObserved.seconds
        transactionProgress.progress = 1
        transactionProgress.errors = txObserved.error
        return transactionProgress
      case 1:
        if (txData.tx.tx?.chain != undefined) {
          sourceChain = getChain(txData.tx.tx.chain)
          if (sourceChain == (BTCChain || BCHChain || LTCChain)) {
            const lastBlockHeight = lastBlock.find((obj) => obj.chain === sourceChain)
            const checkConf = await this.checkConfcounting(
              sourceChain,
              `${lastBlockHeight?.last_observed_in}`,
              txData.tx,
            )
            console.log(checkConf)
          }
        }
        transactionProgress.progress = 2
        return transactionProgress
      case 2:
        const tcBlockHeight = lastBlock.find((obj) => obj.thorchain)
        const checkOutboundQueue = await this.checkOutboundQueue(inboundTxHash, tcBlockHeight)
        transactionProgress.seconds = checkOutboundQueue.seconds
        transactionProgress.errors = checkOutboundQueue.error
        transactionProgress.progress = 444
        return transactionProgress
      case 3:
        const tcBlock = lastBlock.find((obj) => obj.thorchain)
        const checkOutboundQue = await this.checkOutboundQueue(inboundTxHash, tcBlock)
        transactionProgress.seconds = checkOutboundQue.seconds
        transactionProgress.progress = 4
        return transactionProgress
      default:
        return transactionProgress
    }
  }

  /** Stage 1  */
  /**
   * Check if transaction has been observed by bifrost or THORNode.
   * If there is source chain info, use that determine the wait time else wait one minute
   *
   * @param observed_tx - transaction data based from an input hash
   * @param sourceChain
   * @returns
   */
  private async checkTCRecords(txData: TxSignersResponse, sourceChain?: Chain): Promise<TransactionStatus> {
    const stageStatus: TransactionStatus = {
      seconds: 0,
      error: [],
    }
    if (JSON.stringify(txData.tx) == undefined) {
      if (sourceChain) {
        stageStatus.seconds = this.chainAttributes[sourceChain].avgBlockTimeInSecs
      } else {
        stageStatus.seconds = 60
        stageStatus.error.push(`No observed tx, wait sixty seconds`)
      }
    }

    return stageStatus
  }

  /** Stage 2
   *
   * 1. Find observed_tx.finalise_height and the current observation height (observed_tx.block_height)
   * 2. If last_observed_in (current observation height) is less then the finalise_height, will need to wait tillast_observed_in = finalise_height before thorchain starts processing the transaction.
   * 3. If there is a wait, find the block difference (in source chain) then times by block time to find the conf counting wait time
   *
   * @param observed_tx - transaction data based from an input hash
   * @param sourceChain - in tx chain, should be known at this point.
   * @param lastSourceBlock
   * @returns - transaction stage
   */
  private checkConfcounting(sourceChain: Chain, lastSourceBlock: string, observed_tx?: ObservedTx): Date {
    const timeToFinalised = new Date()
    if (
      observed_tx?.block_height &&
      observed_tx?.finalise_height &&
      Number(lastSourceBlock) < observed_tx.finalise_height
    ) {
      // If observed but not final, need to wait till the finalised block before moving to the next stage, blocks in source chain
      if (observed_tx.block_height < observed_tx.finalise_height) {
        const blocksToWait = observed_tx.finalise_height - observed_tx?.block_height // how many source blocks to wait.
        timeToFinalised.setSeconds(blocksToWait * this.chainAttributes[sourceChain].avgBlockTimeInSecs)
      }
    }
    return timeToFinalised
  }

  /** Stage 3 */
  /**
   * Regardless of the transaction size, if the network is under load, Txs will need to wait. Given a size of a transaction AND the current network load, THORNode can assign a future block for the outgoing transaction.
   * A user needs to wait for that block to be reached before a TX is sent.
   *
   * Steps.
   * 1. See if there is an outbound queue. If none, outTx has been sent.
   * 2. Find the targetblock the oubound Tx will be sent in for the given inbound Tx hash.
   * 3. Compare that against the current TC height to see the block different then times the TC block time to get seconds.
   *
   * @param inboundTxHash
   * @param lastBlockHeight
   * @returns
   */
  private async checkOutboundQueue(inboundTxHash: string, lastBlockHeight?: LastBlock): Promise<TransactionStatus> {
    const stageStatus: TransactionStatus = { seconds: 0, error: [] }
    const scheduledQueueItem = (await this.thorchainCache.thornode.getscheduledQueue()).find(
      (item: TxOutItem) => item.in_hash === inboundTxHash,
    )
    const scheduledQueueLength = (await this.thorchainCache.thornode.getscheduledQueue()).length
    if (scheduledQueueLength > 0 && scheduledQueueItem == undefined) {
      stageStatus.error.push(`Scheduled queue count ${scheduledQueueLength}`)
      stageStatus.error.push(`Could not find tx in outbound queue`)
    } else {
      if (scheduledQueueItem?.height && lastBlockHeight?.thorchain) {
        stageStatus.seconds =
          (scheduledQueueItem.height - lastBlockHeight?.thorchain) * this.chainAttributes[THORChain].avgBlockTimeInSecs
      }
    }
    return stageStatus
  }

  /**
   * Checks too see if the transaction is synth from the memo
   * @param txData  - input txData
   * @returns - boolean
   */
  private async isSynthTransaction(txData: TxSignersResponse): Promise<boolean> {
    const memo = txData.tx.tx.memo
    const synth = memo?.split(`:`)[1].match(`/`) ? true : false
    return synth
  }
}
