import { Network } from '@xchainjs/xchain-client'
import { Action, PoolDetail, SwapMetadata, Transaction } from '@xchainjs/xchain-mayamidgard'
import { QuoteSwapResponse } from '@xchainjs/xchain-mayanode'
import {
  Address,
  AssetCryptoAmount,
  CryptoAmount,
  assetFromStringEx,
  assetToString,
  baseAmount,
  eqAsset,
  isSynthAsset,
} from '@xchainjs/xchain-util'

import { MayachainCache } from './mayachain-cache'
import {
  CompatibleAsset,
  InboundDetail,
  MAYANameDetails,
  QuoteMAYAName,
  QuoteMAYANameParams,
  QuoteSwap,
  QuoteSwapParams,
  SwapHistoryParams,
  SwapsHistory,
  TransactionAction,
} from './types'
import {
  ArbAsset,
  ArbChain,
  BtcAsset,
  BtcChain,
  CacaoAsset,
  DEFAULT_MAYACHAIN_DECIMALS,
  DashAsset,
  DashChain,
  EthAsset,
  EthChain,
  KujiraAsset,
  KujiraChain,
  MayaChain,
  RuneAsset,
  ThorChain,
  XdrAsset,
  XdrChain,
  getAssetFromMemo,
  getBaseAmountWithDiffDecimals,
  getCryptoAmountWithNotation,
} from './utils'

/**
 * MAYAChain Class for interacting with MAYAChain.
 * Recommended main class to use for swapping with MAYAChain
 * Has access to Midgard and MAYANode data
 */
export class MayachainQuery {
  private mayachainCache: MayachainCache

  /**
   * Constructor to create a MayachainAMM
   * @param mayachainCache - an instance of the MayachainCache (could be pointing to stagenet,testnet,mainnet)
   * @param chainAttributes - attributes used to calculate waitTime & conf counting
   * @returns MayachainAMM
   */
  constructor(mayachainCache = new MayachainCache()) {
    // Initialize MayachainCache instance
    this.mayachainCache = mayachainCache
  }

  /**
   * Get the Mayachain network.
   * @returns
   */
  public getNetwork(): Network {
    return this.mayachainCache.midgardQuery.getNetwork()
  }

  /**
   *  Quote a swap operation.
   * @param {QuoteSwapParams} quoteSwapParams - Parameters for the quote swap operation.
   * @returns {QuoteSwap} A quote for the swap operation.
   */
  public async quoteSwap({
    fromAsset,
    destinationAsset,
    amount,
    destinationAddress,
    toleranceBps,
    affiliateBps,
    affiliateAddress,
    height,
    streamingInterval,
    streamingQuantity,
  }: QuoteSwapParams): Promise<QuoteSwap> {
    const fromAssetString = assetToString(fromAsset)
    const toAssetString = assetToString(destinationAsset)
    // Endpoint allows 10 decimals for Cacao, 8 for the rest of assets
    const inputAmount =
      fromAssetString === assetToString(CacaoAsset)
        ? amount.baseAmount.amount()
        : getBaseAmountWithDiffDecimals(amount, 8)

    const swapQuote: QuoteSwapResponse = await this.mayachainCache.mayanode.getSwapQuote(
      fromAssetString,
      toAssetString,
      inputAmount.toNumber(),
      destinationAddress,
      streamingInterval,
      streamingQuantity,
      toleranceBps,
      affiliateBps,
      affiliateAddress,
      height,
    )

    const response: { error?: string } = JSON.parse(JSON.stringify(swapQuote))
    if (response.error) {
      return {
        toAddress: ``,
        memo: ``,
        expectedAmount: new CryptoAmount(baseAmount(0), destinationAsset),
        dustThreshold: this.getChainDustValue(fromAsset.chain),
        fees: {
          asset: destinationAsset,
          affiliateFee: new CryptoAmount(baseAmount(0), destinationAsset),
          outboundFee: new CryptoAmount(baseAmount(0), destinationAsset),
          liquidityFee: new CryptoAmount(baseAmount(0), destinationAsset),
          totalFee: new CryptoAmount(baseAmount(0), destinationAsset),
        },
        outboundDelayBlocks: 0,
        outboundDelaySeconds: 0,
        inboundConfirmationSeconds: 0,
        inboundConfirmationBlocks: 0,
        canSwap: false,
        errors: [`Mayanode request quote: ${response.error}`],
        expiry: 0,
        slipBasisPoints: 0,
        totalSwapSeconds: 0,
        streamingSwapSeconds: 0,
        streamingSwapBlocks: 0,
        maxStreamingQuantity: 0,
        warning: '',
      }
    }

    const feeAsset = assetFromStringEx(swapQuote.fees.asset) as CompatibleAsset

    const errors: string[] = []
    if (swapQuote.memo === undefined) errors.push(`Error parsing swap quote: Memo is ${swapQuote.memo}`)

    const isFeeAssetCacao = swapQuote.fees.asset === assetToString(CacaoAsset)
    return {
      toAddress: swapQuote.inbound_address || '',
      memo: swapQuote.memo || '',
      expectedAmount: new CryptoAmount(
        baseAmount(swapQuote.expected_amount_out, toAssetString === assetToString(CacaoAsset) ? 10 : 8),
        destinationAsset,
      ),
      dustThreshold: this.getChainDustValue(fromAsset.chain),
      fees: {
        asset: feeAsset,
        affiliateFee: new CryptoAmount(baseAmount(swapQuote.fees.affiliate, isFeeAssetCacao ? 10 : 8), feeAsset),
        outboundFee: new CryptoAmount(baseAmount(swapQuote.fees.outbound, isFeeAssetCacao ? 10 : 8), feeAsset),
        liquidityFee: new CryptoAmount(baseAmount(swapQuote.fees.liquidity, isFeeAssetCacao ? 10 : 8), feeAsset),
        totalFee: new CryptoAmount(baseAmount(swapQuote.fees.total, isFeeAssetCacao ? 10 : 8), feeAsset),
      },
      expiry: swapQuote.expiry,
      recommendedMinAmountIn: new CryptoAmount(
        baseAmount(swapQuote.recommended_min_amount_in || '0', eqAsset(fromAsset, CacaoAsset) ? 10 : 8),
        fromAsset,
      ),
      router: swapQuote.router,
      recommendedGasRate: swapQuote.recommended_gas_rate,
      gasRateUnits: swapQuote.gas_rate_units,
      slipBasisPoints: swapQuote.fees.slippage_bps,
      outboundDelayBlocks: swapQuote.outbound_delay_blocks,
      outboundDelaySeconds: swapQuote.outbound_delay_seconds,
      inboundConfirmationSeconds: swapQuote.inbound_confirmation_seconds,
      inboundConfirmationBlocks: swapQuote.inbound_confirmation_blocks,
      maxStreamingQuantity: swapQuote.max_streaming_quantity,
      streamingSwapBlocks: swapQuote.streaming_swap_blocks,
      streamingSwapSeconds: swapQuote.streaming_swap_seconds,
      totalSwapSeconds: swapQuote.total_swap_seconds || 0,
      canSwap: !(!swapQuote.memo || errors.length > 0),
      errors,
      warning: '',
    }
  }

  /**
   * Return mayachain supported chains dust amounts
   * @returns a map where chain is the key and dust amount cryptoAmount as value
   */
  public getDustValues(): Record<string, AssetCryptoAmount> {
    // TODO: Find out how to fetch native asset decimals
    return {
      [BtcChain]: new AssetCryptoAmount(baseAmount(10000, 8), BtcAsset),
      [EthChain]: new AssetCryptoAmount(baseAmount(0, 18), EthAsset),
      [DashChain]: new AssetCryptoAmount(baseAmount(10000, 8), DashAsset),
      [KujiraChain]: new AssetCryptoAmount(baseAmount(0, 6), KujiraAsset),
      [ThorChain]: new AssetCryptoAmount(baseAmount(0, 8), RuneAsset),
      [MayaChain]: new AssetCryptoAmount(baseAmount(0, 10), CacaoAsset),
      [ArbChain]: new AssetCryptoAmount(baseAmount(0, 18), ArbAsset),
      [XdrChain]: new AssetCryptoAmount(baseAmount(0, 18), XdrAsset),
    }
  }

  /**
   * Return the dust crypto amount from the given chain
   * @param {string} chain Chain to retrieve the dust amount of
   * @returns a map where chain is the key and dust amount cryptoAmount as value
   */
  public getChainDustValue(chain: string): AssetCryptoAmount {
    const dustValue = this.getDustValues()[chain]
    if (!dustValue) throw Error(`No dust value known for ${chain} chain`)
    return dustValue
  }

  /**
   * Get MAYAname details
   * @param {string} MAYAName
   * @returns {MAYANameDetails | undefined} MAYANames details or undefined it is does not exist
   */
  public async getMAYANameDetails(MAYAName: string): Promise<MAYANameDetails | undefined> {
    const details = await this.mayachainCache.midgardQuery.getMAYANameDetails(MAYAName)
    if (!details) return undefined

    return {
      name: MAYAName,
      owner: details.owner,
      expireBlockHeight: Number(details.expire),
      aliases: details.entries,
    }
  }

  /**
   * Get inbound addresses details
   * @returns Inbound details
   */
  public async getInboundDetails(): Promise<Record<string, InboundDetail>> {
    return this.mayachainCache.getInboundDetails()
  }

  /**
   * Get chain inbound address details
   * @returns Inbound details
   */
  public async getChainInboundDetails(chain: string): Promise<InboundDetail> {
    const inboundDetails = await this.getInboundDetails()
    if (!inboundDetails[chain]) throw Error(`No inbound details known for ${chain} chain`)
    return inboundDetails[chain]
  }

  /**
   * Get asset decimals
   * @param {Asset} asset
   * @returns the asset decimals
   * @throws {Error} if the asset is not supported in Mayachain
   */
  public async getAssetDecimals(asset: CompatibleAsset): Promise<number> {
    if (isSynthAsset(asset)) return DEFAULT_MAYACHAIN_DECIMALS

    const assetNotation = assetToString(asset)
    const assetsDecimals = await this.mayachainCache.getAssetDecimals()
    if (!assetsDecimals[assetNotation]) throw Error(`Can not get decimals for ${assetNotation}`)

    return assetsDecimals[assetNotation]
  }

  /**
   * Get pools details
   * @returns {PoolDetail[]} pools details
   */
  public async getPools(): Promise<PoolDetail[]> {
    return this.mayachainCache.getPools()
  }

  /**
   * Get swap addresses swap history
   * @param {SwapHistoryParams} params Swap history params
   * @param {Address[]} params.addresses - List of addresses
   * @returns {SwapsHistory} Swap history
   */
  public async getSwapHistory({ addresses }: SwapHistoryParams): Promise<SwapsHistory> {
    const actionsResume = await this.mayachainCache.midgardQuery.getActions({
      address: addresses.join(','),
      type: 'swap',
    })
    const assetDecimals = await this.mayachainCache.getAssetDecimals()

    const getCryptoAmount = (
      assetDecimals: Record<string, number>,
      asset: string,
      amount: string,
    ): CryptoAmount<CompatibleAsset> => {
      const decimals = asset in assetDecimals ? assetDecimals[asset] : DEFAULT_MAYACHAIN_DECIMALS
      const assetFormatted = assetFromStringEx(asset) as CompatibleAsset
      return decimals === DEFAULT_MAYACHAIN_DECIMALS || eqAsset(CacaoAsset, assetFormatted)
        ? new CryptoAmount(baseAmount(amount, decimals), assetFormatted)
        : getCryptoAmountWithNotation(new CryptoAmount(baseAmount(amount), assetFormatted), decimals)
    }

    return {
      count: actionsResume.count ? Number(actionsResume.count) : 0,
      swaps: actionsResume.actions
        // Merge duplicated swaps in just one
        .reduce((prev, current) => {
          const index = prev.findIndex((action) => action.in[0].txID === current.in[0].txID)
          if (index === -1) return [...prev, current]

          for (let i = 0; i < current.in.length; i++) {
            prev[index].in[i].coins[0].amount = String(
              Number(prev[index].in[i].coins[0].amount) + Number(current.in[i].coins[0].amount),
            )
          }
          return prev
        }, [] as Action[])
        .map((action) => {
          const inboundTx: TransactionAction = {
            hash: action.in[0].txID,
            address: action.in[0].address,
            amount: getCryptoAmount(assetDecimals, action.in[0].coins[0].asset, action.in[0].coins[0].amount),
          }

          const fromAsset: CompatibleAsset = inboundTx.amount.asset
          const toAsset: CompatibleAsset = getAssetFromMemo((action.metadata.swap as SwapMetadata).memo)

          if (action.status === 'pending') {
            return {
              date: new Date(Number(action.date) / 10 ** 6),
              status: 'pending',
              fromAsset,
              toAsset,
              inboundTx,
            }
          }

          const transaction: Transaction =
            action.out.filter((out) => out.txID !== '')[0] ||
            action.out.sort((out1, out2) => Number(out2.coins[0].amount) - Number(out1.coins[0].amount))[0] // For non to protocol asset swap

          return {
            date: new Date(Number(action.date) / 10 ** 6),
            status: 'success',
            fromAsset,
            toAsset,
            inboundTx,
            outboundTx: {
              hash: transaction.txID,
              address: transaction.address,
              amount: getCryptoAmount(assetDecimals, transaction.coins[0].asset, transaction.coins[0].amount),
            },
          }
        }),
    }
  }

  /**
   * Get the MAYANames owned by an address
   * @param {Address} owner - Thorchain address
   * @returns {MAYANameDetails[]} List of MAYANames owned by the address
   */
  public async getMAYANamesByOwner(owner: Address): Promise<MAYANameDetails[]> {
    const mayaNames = await this.mayachainCache.midgardQuery.getMAYANameReverseLookup(owner)

    if (!mayaNames || mayaNames.length === 0) return []

    const tasks = mayaNames.map((mayaName) => this.getMAYANameDetails(mayaName))

    const mayaNamesDetails = await Promise.all(tasks)
    return mayaNamesDetails.filter((mayaNameDetails) => mayaNameDetails !== undefined) as MAYANameDetails[]
  }

  /**
   * Estimate the cost of an update or MAYAName registration
   * @param {QuoteMAYANameParams} params Params to make the update or the registration
   * @returns {QuoteMAYAName} Memo to make the update or the registration and the estimation of the operation
   */
  public async estimateMAYAName({
    name,
    owner,
    isUpdate,
    expiry,
    chain,
    chainAddress,
  }: QuoteMAYANameParams): Promise<QuoteMAYAName> {
    const details = await this.getMAYANameDetails(name)

    if (!details && isUpdate) {
      throw Error('Can not update an unregistered MAYAName')
    }

    if (details?.owner && !isUpdate) {
      throw Error('MAYAName already registered')
    }

    let numberOfBlocksToAddToExpiry = isUpdate ? 0 : 5_256_000 // Average blocks per year https://docs.mayaprotocol.com/mayachain-dev-docs/introduction/mayaname-guide

    if (expiry) {
      const numberOfSecondsToExpire = Math.floor(expiry.getTime() / 1000) - Math.floor(Date.now() / 1000)
      if (numberOfSecondsToExpire < 0) throw Error('Can not update expiry time before the one already registered')
      numberOfBlocksToAddToExpiry = Math.round(numberOfSecondsToExpire / 6) // 1 block every 6 seconds
    }

    // Calculate fee

    const constantsDetails = await this.mayachainCache.mayanode.getMimir()
    const assetDecimals = await this.mayachainCache.getAssetDecimals()
    const oneTimeFee = isUpdate
      ? baseAmount(0, assetDecimals[assetToString(CacaoAsset)])
      : baseAmount(constantsDetails['TNSREGISTERFEE'], assetDecimals[assetToString(CacaoAsset)])

    const totalFeePerBlock = baseAmount(constantsDetails['TNSFEEPERBLOCK']).times(
      numberOfBlocksToAddToExpiry > 0 ? numberOfBlocksToAddToExpiry : 0,
    )

    const txFee = baseAmount(constantsDetails['NATIVETRANSACTIONFEE'], assetDecimals[assetToString(CacaoAsset)])

    return {
      value: new AssetCryptoAmount(oneTimeFee.plus(totalFeePerBlock).plus(txFee), CacaoAsset),
      memo: `~:${name}:${isUpdate ? chain || details?.aliases[0].chain : chain}:${
        isUpdate ? chainAddress || details?.aliases[0].address : chainAddress
      }:${isUpdate ? owner || details?.owner : owner}:MAYA.CACAO`,
    }
  }
}
