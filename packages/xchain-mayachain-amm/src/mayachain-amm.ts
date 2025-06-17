/**
 * Import necessary modules and libraries
 */
import { Client as ArbClient, defaultArbParams } from '@xchainjs/xchain-arbitrum'
import { defaultZECParams, Client as ZecClient } from '@xchainjs/xchain-zcash'
import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { Client as DashClient, defaultDashParams } from '@xchainjs/xchain-dash'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { MAX_APPROVAL } from '@xchainjs/xchain-evm'
import { Client as KujiraClient, defaultKujiParams } from '@xchainjs/xchain-kujira'
import { AssetCacao, CACAO_DECIMAL, Client as MayaClient, MAYAChain } from '@xchainjs/xchain-mayachain'
import {
  MAYANameDetails,
  MayachainQuery,
  QuoteSwap,
  QuoteSwapParams,
  RegisterMAYAName,
  UpdateMAYAName,
} from '@xchainjs/xchain-mayachain-query'
import { Client as RadixClient } from '@xchainjs/xchain-radix'
import { Client as ThorClient } from '@xchainjs/xchain-thorchain'
import {
  Address,
  AssetCryptoAmount,
  CryptoAmount,
  assetToString,
  baseAmount,
  isSynthAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { MayachainAction } from './mayachain-action'
import { ApproveParams, IsApprovedParams, QuoteMAYAName, TxSubmitted } from './types'
import { isProtocolERC20Asset, isTokenCryptoAmount, validateAddress } from './utils'

/**
 * Mayachain Automated Market Maker (AMM) class.
 * MAYAChainAMM class for interacting with THORChain.
 * Recommended main class to use for swapping with MAYAChain
 * Has access to Midgard and MayaNode data
 */
export class MayachainAMM {
  private mayachainQuery: MayachainQuery
  private wallet: Wallet

  /**
   * Constructor to create a MayachainAMM instance.
   *
   * @param {MayachainQuery} mayachainQuery An instance of the MayachainQuery class.
   * @param {Wallet} wallet A wallet instance containing clients for various blockchains.
   * @returns {MayachainAMM} Returns the MayachainAMM instance.
   */
  constructor(
    mayachainQuery = new MayachainQuery(),
    wallet = new Wallet({
      BTC: new BtcClient({ ...defaultBtcParams, network: Network.Mainnet }),
      ETH: new EthClient({ ...defaultEthParams, network: Network.Mainnet }),
      DASH: new DashClient({ ...defaultDashParams, network: Network.Mainnet }),
      KUJI: new KujiraClient({ ...defaultKujiParams, network: Network.Mainnet }),
      ARB: new ArbClient({ ...defaultArbParams, network: Network.Mainnet }),
      THOR: new ThorClient({ network: Network.Mainnet }),
      MAYA: new MayaClient({ network: Network.Mainnet }),
      XRD: new RadixClient({ network: Network.Mainnet }),
      ZEC: new ZecClient({ ...defaultZECParams, network: Network.Mainnet }),
    }),
  ) {
    this.mayachainQuery = mayachainQuery
    this.wallet = wallet
  }

  /**
   * Estimate swap by validating the swap parameters.
   *
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters.
   * @returns {QuoteSwap} Quote swap result. If swap cannot be done, it returns an empty QuoteSwap with reasons.
   */
  public async estimateSwap({
    fromAsset,
    fromAddress,
    amount,
    destinationAsset,
    destinationAddress,
    affiliateAddress,
    affiliateBps,
    toleranceBps,
    streamingInterval,
    streamingQuantity,
  }: QuoteSwapParams): Promise<QuoteSwap> {
    const errors = await this.validateSwap({
      fromAsset,
      fromAddress,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      affiliateBps,
      streamingInterval,
      streamingQuantity,
    })

    if (errors.length > 0) {
      return {
        toAddress: ``,
        memo: ``,
        expectedAmount: new CryptoAmount(baseAmount(0), destinationAsset),
        dustThreshold: this.mayachainQuery.getChainDustValue(fromAsset.chain),
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
        errors,
        slipBasisPoints: 0,
        totalSwapSeconds: 0,
        expiry: 0,
        warning: '',
      }
    }

    return this.mayachainQuery.quoteSwap({
      fromAsset,
      fromAddress,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      affiliateBps,
      toleranceBps,
      streamingInterval,
      streamingQuantity,
    })
  }

  /**
   * Validate swap parameters before performing a swap operation.
   *
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters.
   * @returns {string[]} Reasons the swap cannot be executed. Empty array if the swap is valid.
   */
  public async validateSwap({
    fromAsset,
    fromAddress,
    destinationAsset,
    destinationAddress,
    amount,
    affiliateAddress,
    affiliateBps,
    streamingInterval,
    streamingQuantity,
  }: QuoteSwapParams): Promise<string[]> {
    const errors: string[] = []

    // Validate destination address if provided
    if (
      destinationAddress &&
      !validateAddress(
        this.mayachainQuery.getNetwork(),
        isSynthAsset(destinationAsset) ? MAYAChain : destinationAsset.chain,
        destinationAddress,
      )
    ) {
      errors.push(`destinationAddress ${destinationAddress} is not a valid address`)
    }
    // Validate affiliate address if provided
    if (affiliateAddress) {
      const isMayaAddress = validateAddress(this.mayachainQuery.getNetwork(), MAYAChain, affiliateAddress)
      const isMayaName = await this.isMAYAName(affiliateAddress)
      if (!(isMayaAddress || isMayaName))
        errors.push(`affiliateAddress ${affiliateAddress} is not a valid MAYA address`)
    }
    // Validate affiliate basis points if provided
    if (affiliateBps && (affiliateBps < 0 || affiliateBps > 10000)) {
      errors.push(`affiliateBps ${affiliateBps} out of range [0 - 10000]`)
    }
    // Validate approval if asset is an ERC20 token and fromAddress is provided
    if (isProtocolERC20Asset(fromAsset) && fromAddress) {
      if (!isTokenCryptoAmount(amount)) {
        errors.push(`${assetToString(amount.asset)} is not Token asset amount`)
      } else {
        const approveErrors = await this.isRouterApprovedToSpend({
          asset: fromAsset,
          address: fromAddress,
          amount,
        })
        errors.push(...approveErrors)
      }
    }

    if (streamingQuantity && streamingQuantity < 0) {
      errors.push('streaming quantity can not be lower than 0')
    }

    if (streamingInterval && streamingInterval < 0) {
      errors.push('streaming interval can not be lower than 0')
    }

    return errors
  }

  /**
   * Perform a swap operation between assets.
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters
   * @returns {TxSubmitted} Transaction hash and URL of the swap
   */
  public async doSwap({
    fromAsset,
    fromAddress,
    amount,
    destinationAsset,
    destinationAddress,
    affiliateAddress,
    affiliateBps,
    toleranceBps,
    streamingInterval,
    streamingQuantity,
  }: QuoteSwapParams): Promise<TxSubmitted> {
    const quoteSwap = await this.estimateSwap({
      fromAsset,
      fromAddress,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      affiliateBps,
      toleranceBps,
      streamingInterval,
      streamingQuantity,
    })
    // Check if the swap can be performed
    if (!quoteSwap.canSwap) throw Error(`Can not swap. ${quoteSwap.errors.join(' ')}`)

    return MayachainAction.makeAction({
      wallet: this.wallet,
      assetAmount: amount,
      memo: quoteSwap.memo,
      recipient: `${quoteSwap.toAddress}`,
    })
  }

  /**
   * Approve the Mayachain router to spend a certain amount in the asset chain.
   * @param {ApproveParams} approveParams Parameters for approving the router to spend
   * @returns {Promise<TxSubmitted>} Transaction hash and URL
   */
  public async approveRouterToSpend({ asset, amount }: ApproveParams): Promise<TxSubmitted> {
    // Get inbound details for the asset chain
    const inboundDetails = await this.mayachainQuery.getChainInboundDetails(asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router address for ${asset.chain}`)
    // Perform approval
    const hash = await this.wallet.approve(
      asset,
      amount?.baseAmount || baseAmount(MAX_APPROVAL.toString(), await this.mayachainQuery.getAssetDecimals(asset)),
      inboundDetails.router,
    )
    // Return transaction hash and URL
    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(asset.chain, hash),
    }
  }

  /**
   * Validate if the asset router is allowed to spend the asset amount on behalf of the address.
   * @param {IsApprovedParams} isApprovedParams Parameters for checking approval.
   * @returns {string[]} Reasons the asset router is not allowed to spend the amount. Empty array if the router is approved.
   */
  public async isRouterApprovedToSpend({ asset, amount, address }: IsApprovedParams): Promise<string[]> {
    const errors: string[] = []

    if (!isProtocolERC20Asset(asset)) {
      errors.push('Asset should be ERC20')
      return errors
    }

    // Get inbound details for the asset chain
    const inboundDetails = await this.mayachainQuery.getChainInboundDetails(asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router address for ${asset.chain}`)
    // Check if the router is approved to spend the amount
    const isApprovedResult = await this.wallet.isApproved(asset, amount.baseAmount, address, inboundDetails.router)

    if (!isApprovedResult) errors.push('Maya router has not been approved to spend this amount')

    return errors
  }

  /**
   * Get MAYAname details
   * @param {string} MAYAName
   * @returns {MAYANameDetails | undefined} MAYANames details or undefined it is does not exist
   */
  public async getMAYANameDetails(MAYAName: string): Promise<MAYANameDetails | undefined> {
    return this.mayachainQuery.getMAYANameDetails(MAYAName)
  }

  /**
   * Get the MAYANames owned by an address
   * @param {Address} owner - Thorchain address
   * @returns {MAYANameDetails[]} List of MAYANames owned by the address
   */
  public async getMAYANamesByOwner(owner: Address): Promise<MAYANameDetails[]> {
    return this.mayachainQuery.getMAYANamesByOwner(owner)
  }

  /**
   * Estimate the cost of a MAYAName registration
   * @param {RegisterMAYAName} params Params to make the registration
   * @returns {QuoteMAYAName} Memo to make the registration and the estimation of the operation
   */
  public async estimateMAYANameRegistration(params: RegisterMAYAName): Promise<QuoteMAYAName> {
    const errors: string[] = []

    if (!validateAddress(this.mayachainQuery.getNetwork(), params.chain, params.chainAddress)) {
      errors.push(`Invalid address ${params.chainAddress} for ${params.chain} chain`)
    }

    if (!validateAddress(this.mayachainQuery.getNetwork(), MAYAChain, params.owner)) {
      errors.push(`Invalid owner ${params.owner} due it is not a MAYAChain address`)
    }

    if (errors.length) {
      return {
        memo: '',
        errors,
        value: new AssetCryptoAmount(baseAmount(0, CACAO_DECIMAL), AssetCacao),
        allowed: false,
      }
    }

    try {
      const estimated = await this.mayachainQuery.estimateMAYAName({ ...params })

      return {
        ...estimated,
        allowed: true,
        errors: [],
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return {
        memo: '',
        errors: ['message' in e ? e.message : `Unknown error: ${e}`],
        value: new AssetCryptoAmount(baseAmount(0, CACAO_DECIMAL), AssetCacao),
        allowed: false,
      }
    }
  }

  /**
   * Estimate the cost of an update of a MAYAName
   * @param {QuoteMAYANameParams} params Params to make the update
   * @returns {QuoteMAYAName} Memo to make the update and the estimation of the operation
   */
  public async estimateMAYANameUpdate(params: UpdateMAYAName): Promise<QuoteMAYAName> {
    const errors: string[] = []

    if ((params.chain && !params.chainAddress) || (!params.chain && params.chainAddress)) {
      errors.push(`Alias not provided correctly`)
    }

    if (
      params.chain &&
      params.chainAddress &&
      !validateAddress(this.mayachainQuery.getNetwork(), params.chain, params.chainAddress)
    ) {
      errors.push(`Invalid alias ${params.chainAddress} for ${params.chain} chain`)
    }

    if (params.owner && !validateAddress(this.mayachainQuery.getNetwork(), MAYAChain, params.owner)) {
      errors.push(`Invalid owner ${params.owner} due it is not a MAYAChain address`)
    }

    if (errors.length) {
      return {
        memo: '',
        errors,
        value: new AssetCryptoAmount(baseAmount(0, CACAO_DECIMAL), AssetCacao),
        allowed: false,
      }
    }

    try {
      const estimated = await this.mayachainQuery.estimateMAYAName({ ...params, isUpdate: true })

      return {
        ...estimated,
        allowed: true,
        errors: [],
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return {
        memo: '',
        errors: ['message' in e ? e.message : `Unknown error: ${e}`],
        value: new AssetCryptoAmount(baseAmount(0, CACAO_DECIMAL), AssetCacao),
        allowed: false,
      }
    }
  }

  /**
   * Register a MAYAName
   * @param {RegisterMAYAName} params Params to make the registration
   * @returns {QuoteMAYAName} Memo to make the update or the registration and the estimation of the operation
   */
  public async registerMAYAName(params: RegisterMAYAName): Promise<TxSubmitted> {
    const quote = await this.estimateMAYANameRegistration(params)

    if (!quote.allowed) throw Error(`Can not register MAYAName. ${quote.errors.join(' ')}`)

    return MayachainAction.makeAction({
      wallet: this.wallet,
      assetAmount: quote.value,
      memo: quote.memo,
    })
  }

  /**
   * Update a MAYAName
   * @param {QuoteMAYANameParams} params Params to make the update
   * @returns {QuoteMAYAName} Memo to make the update or the registration and the estimation of the operation
   */
  public async updateMAYAName(params: UpdateMAYAName): Promise<TxSubmitted> {
    const quote = await this.estimateMAYANameUpdate(params)

    if (!quote.allowed) throw Error(`Can not update MAYAName. ${quote.errors.join(' ')}`)

    return MayachainAction.makeAction({
      wallet: this.wallet,
      assetAmount: quote.value,
      memo: quote.memo,
    })
  }

  /**
   * Check if a name is a valid MAYAName
   * @param {string} name MAYAName to check
   * @returns {boolean} True if the name is registered as a MAYAName, otherwise false
   */
  private async isMAYAName(name: string): Promise<boolean> {
    return !!(await this.mayachainQuery.getMAYANameDetails(name))
  }
}
