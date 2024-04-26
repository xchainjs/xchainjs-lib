import { Network } from '@xchainjs/xchain-client'
import { PoolDetail } from '@xchainjs/xchain-mayamidgard'
import { MAYANameDetails } from '@xchainjs/xchain-mayamidgard-query'
import { QuoteSwapResponse } from '@xchainjs/xchain-mayanode'
import {
  Asset,
  CryptoAmount,
  assetFromStringEx,
  assetToString,
  baseAmount,
  eqAsset,
  isSynthAsset,
} from '@xchainjs/xchain-util'

import { MayachainCache } from './mayachain-cache'
import { InboundDetail, QuoteSwap, QuoteSwapParams, SwapHistoryParams, SwapsHistory } from './types'
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
        expectedAmount: new CryptoAmount(
          baseAmount(0, toAssetString === assetToString(CacaoAsset) ? 10 : 8),
          destinationAsset,
        ),
        dustThreshold: this.getChainDustValue(fromAsset.chain),
        fees: {
          asset: destinationAsset,
          affiliateFee: new CryptoAmount(
            baseAmount(0, toAssetString === assetToString(CacaoAsset) ? 10 : 8),
            destinationAsset,
          ),
          outboundFee: new CryptoAmount(
            baseAmount(0, toAssetString === assetToString(CacaoAsset) ? 10 : 8),
            destinationAsset,
          ),
        },
        outboundDelayBlocks: 0,
        outboundDelaySeconds: 0,
        inboundConfirmationSeconds: 0,
        inboundConfirmationBlocks: 0,
        canSwap: false,
        errors: [`Mayanode request quote: ${response.error}`],
        slipBasisPoints: 0,
        totalSwapSeconds: 0,
        warning: '',
      }
    }

    const feeAsset = assetFromStringEx(swapQuote.fees.asset)

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
      },
      slipBasisPoints: swapQuote.slippage_bps,
      outboundDelayBlocks: swapQuote.outbound_delay_blocks,
      outboundDelaySeconds: swapQuote.outbound_delay_seconds,
      inboundConfirmationSeconds: swapQuote.inbound_confirmation_seconds,
      inboundConfirmationBlocks: swapQuote.inbound_confirmation_blocks,
      totalSwapSeconds: (swapQuote.inbound_confirmation_seconds || 0) + swapQuote.outbound_delay_seconds,
      canSwap: !(!swapQuote.memo || errors.length > 0),
      errors,
      warning: '',
    }
  }

  /**
   * Return mayachain supported chains dust amounts
   * @returns a map where chain is the key and dust amount cryptoAmount as value
   */
  public getDustValues(): Record<string, CryptoAmount> {
    // TODO: Find out how to fetch native asset decimals
    return {
      [BtcChain]: new CryptoAmount(baseAmount(10000, 8), BtcAsset),
      [EthChain]: new CryptoAmount(baseAmount(0, 18), EthAsset),
      [DashChain]: new CryptoAmount(baseAmount(10000, 8), DashAsset),
      [KujiraChain]: new CryptoAmount(baseAmount(0, 6), KujiraAsset),
      [ThorChain]: new CryptoAmount(baseAmount(0, 8), RuneAsset),
      [MayaChain]: new CryptoAmount(baseAmount(0, 10), CacaoAsset),
      [ArbChain]: new CryptoAmount(baseAmount(0, 18), ArbAsset),
    }
  }

  /**
   * Return the dust crypto amount from the given chain
   * @param {string} chain Chain to retrieve the dust amount of
   * @returns a map where chain is the key and dust amount cryptoAmount as value
   */
  public getChainDustValue(chain: string): CryptoAmount {
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
    return this.mayachainCache.midgardQuery.getMAYANameDetails(MAYAName)
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
  public async getAssetDecimals(asset: Asset): Promise<number> {
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

    const getCryptoAmount = (assetDecimals: Record<string, number>, asset: string, amount: string): CryptoAmount => {
      const decimals = asset in assetDecimals ? assetDecimals[asset] : DEFAULT_MAYACHAIN_DECIMALS
      return decimals === DEFAULT_MAYACHAIN_DECIMALS || eqAsset(CacaoAsset, assetFromStringEx(asset))
        ? new CryptoAmount(baseAmount(amount, decimals), assetFromStringEx(asset))
        : getCryptoAmountWithNotation(new CryptoAmount(baseAmount(amount), assetFromStringEx(asset)), decimals)
    }

    return {
      count: actionsResume.count ? Number(actionsResume.count) : 0,
      swaps: actionsResume.actions.map((action) => {
        return {
          date: new Date(Number(action.date) / 10 ** 6),
          status: action.status,
          inboundTx: {
            hash: action.in[0].txID,
            address: action.in[0].address,
            amount: getCryptoAmount(assetDecimals, action.in[0].coins[0].asset, action.in[0].coins[0].amount),
          },
          outboundTx: {
            hash: action.out[0].txID,
            address: action.out[0].address,
            amount: getCryptoAmount(assetDecimals, action.out[0].coins[0].asset, action.out[0].coins[0].amount),
          },
        }
      }),
    }
  }
}
