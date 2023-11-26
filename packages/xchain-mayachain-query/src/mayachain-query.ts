import { Network } from '@xchainjs/xchain-client'
import { MAYANameDetails } from '@xchainjs/xchain-mayamidgard-query'
import { QuoteSwapResponse } from '@xchainjs/xchain-mayanode'
import { CryptoAmount, assetFromStringEx, assetToString, baseAmount } from '@xchainjs/xchain-util'

import { MayachainCache } from './mayachain-cache'
import { InboundDetail, QuoteSwap, QuoteSwapParams } from './types'
import {
  BtcAsset,
  BtcChain,
  CacaoAsset,
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
} from './utils'

/**
 * MAYAChain Class for interacting with MAYAChain.
 * Recommended main class to use for swapping with MAYAChain
 * Has access to Midgard and MAYANode data
 */
export class MayachainQuery {
  readonly mayachainCache: MayachainCache

  /**
   * Constructor to create a MayachainAMM
   * @param mayachainCache - an instance of the MayachainCache (could be pointing to stagenet,testnet,mainnet)
   * @param chainAttributes - attributes used to calculate waitTime & conf counting
   * @returns MayachainAMM
   */
  constructor(mayachainCache = new MayachainCache()) {
    this.mayachainCache = mayachainCache
  }

  /**
   * Get the mayachain query is working with
   * @returns
   */
  public getNetwork(): Network {
    return this.mayachainCache.midgardQuery.getNetwork()
  }

  /**
   * Quote a swap
   * @param {QuoteSwapParams} quoteSwapParams - quote swap input params
   * @returns {QuoteSwap}
   */
  public async quoteSwap({
    fromAsset,
    destinationAsset,
    amount,
    fromAddress,
    destinationAddress,
    toleranceBps,
    affiliateBps,
    affiliateAddress,
    height,
  }: QuoteSwapParams): Promise<QuoteSwap> {
    const fromAssetString = assetToString(fromAsset)
    const toAssetString = assetToString(destinationAsset)
    const inputAmount = getBaseAmountWithDiffDecimals(amount, 8)

    const swapQuote: QuoteSwapResponse = await this.mayachainCache.mayanode.getSwapQuote(
      fromAssetString,
      toAssetString,
      inputAmount.toNumber(),
      fromAddress,
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
        expectedAmount: new CryptoAmount(baseAmount(0), destinationAsset),
        dustThreshold: this.getChainDustValue(fromAsset.chain),
        fees: {
          asset: destinationAsset,
          affiliateFee: new CryptoAmount(baseAmount(0), fromAsset),
          outboundFee: new CryptoAmount(baseAmount(0), destinationAsset),
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

    return {
      toAddress: swapQuote.inbound_address || '',
      memo: swapQuote.memo || '',
      expectedAmount: new CryptoAmount(baseAmount(swapQuote.expected_amount_out), destinationAsset),
      dustThreshold: this.getChainDustValue(fromAsset.chain),
      fees: {
        asset: feeAsset,
        affiliateFee: new CryptoAmount(baseAmount(swapQuote.fees.affiliate), feeAsset),
        outboundFee: new CryptoAmount(baseAmount(swapQuote.fees.outbound), feeAsset),
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
      [EthChain]: new CryptoAmount(baseAmount(0, 8), EthAsset),
      [DashChain]: new CryptoAmount(baseAmount(10000, 8), DashAsset),
      [KujiraChain]: new CryptoAmount(baseAmount(0, 8), KujiraAsset),
      [ThorChain]: new CryptoAmount(baseAmount(0, 8), RuneAsset),
      [MayaChain]: new CryptoAmount(baseAmount(0, 8), CacaoAsset),
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
}
