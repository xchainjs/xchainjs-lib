import { Network } from '@xchainjs/xchain-client'
import { Action, PoolDetail, SwapMetadata, Transaction } from '@xchainjs/xchain-mayamidgard'
import { QuoteSwapResponse } from '@xchainjs/xchain-mayanode'
import {
  Address,
  AssetCryptoAmount,
  CryptoAmount,
  SYNTH_ASSET_DELIMITER,
  TOKEN_ASSET_DELIMITER,
  TRADE_ASSET_DELIMITER,
  TradeAsset,
  TradeCryptoAmount,
  assetFromStringEx,
  assetToString,
  baseAmount,
  eqAsset,
  isSynthAsset,
} from '@xchainjs/xchain-util'

import { MayachainCache } from './mayachain-cache'
import {
  AddressTradeAccounts,
  AddressTradeAccountsParams,
  CompatibleAsset,
  InboundDetail,
  MAYANameDetails,
  QuoteMAYAName,
  QuoteMAYANameParams,
  QuoteSwap,
  QuoteSwapParams,
  SwapHistoryParams,
  SwapsHistory,
  TradeAssetAccounts,
  TradeAssetAccountsParams,
  TradeAssetUnits,
  TradeAssetUnitsParams,
  TradeAssetsUnitsParams,
  TransactionAction,
} from './types'
import {
  AdaAsset,
  AdaChain,
  ArbAsset,
  ArbChain,
  BtcAsset,
  BtcChain,
  CacaoAsset,
  CACAO_DECIMAL,
  DEFAULT_MAYACHAIN_DECIMALS,
  DashAsset,
  DashChain,
  EthAsset,
  EthChain,
  MayaAsset,
  MayaChain,
  MAYA_DECIMAL,
  RuneAsset,
  ThorChain,
  ZecAsset,
  ZecChain,
  getBaseAmountWithDiffDecimals,
  getCryptoAmountWithNotation,
} from './utils'

export class MayachainQuery {
  private mayachainCache: MayachainCache

  constructor(mayachainCache = new MayachainCache()) {
    this.mayachainCache = mayachainCache
  }

  public getMayachainCache(): MayachainCache {
    return this.mayachainCache
  }

  public getNetwork(): Network {
    return this.mayachainCache.midgardQuery.getNetwork()
  }

  public async quoteSwap({
    fromAsset,
    destinationAsset,
    amount,
    destinationAddress,
    liquidityToleranceBps,
    toleranceBps,
    affiliateBps,
    affiliateAddress,
    affiliates,
    height,
    streamingInterval,
    streamingQuantity,
  }: QuoteSwapParams): Promise<QuoteSwap> {
    const fromAssetString = assetToString(fromAsset)
    const toAssetString = assetToString(destinationAsset)
    // Endpoint allows 10 decimals for Cacao, 8 for the rest of assets
    const inputAmount = eqAsset(fromAsset, CacaoAsset)
      ? amount.baseAmount.amount()
      : getBaseAmountWithDiffDecimals(amount, this.getQuoteAssetDecimals(fromAsset))

    // If the caller passed a multi-affiliate array, collapse it into the slash-delimited
    // form the protocol's /quote/swap endpoint accepts. The endpoint requires per-affiliate bps
    // (it does not auto-expand a single shared bps), so both fields are joined in parallel.
    const quoteAffiliateAddress = affiliates ? affiliates.map((a) => a.address).join('/') : affiliateAddress
    const quoteAffiliateBps = affiliates ? affiliates.map((a) => a.bps).join('/') : affiliateBps

    const swapQuote: QuoteSwapResponse = await this.mayachainCache.mayanode.getSwapQuote(
      fromAssetString,
      toAssetString,
      inputAmount.toNumber(),
      destinationAddress,
      streamingInterval,
      streamingQuantity,
      liquidityToleranceBps,
      toleranceBps,
      quoteAffiliateBps,
      quoteAffiliateAddress,
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
    if (swapQuote.memo === undefined || swapQuote.memo === '')
      errors.push(`Error parsing swap quote: Memo is ${swapQuote.memo}`)

    return {
      toAddress: swapQuote.inbound_address || '',
      memo: swapQuote.memo || '',
      expectedAmount: new CryptoAmount(
        baseAmount(swapQuote.expected_amount_out, this.getQuoteAssetDecimals(destinationAsset)),
        destinationAsset,
      ),
      dustThreshold: this.getChainDustValue(fromAsset.chain),
      fees: {
        asset: feeAsset,
        affiliateFee: new CryptoAmount(
          baseAmount(swapQuote.fees.affiliate, this.getQuoteAssetDecimals(feeAsset)),
          feeAsset,
        ),
        outboundFee: new CryptoAmount(
          baseAmount(swapQuote.fees.outbound, this.getQuoteAssetDecimals(feeAsset)),
          feeAsset,
        ),
        liquidityFee: new CryptoAmount(
          baseAmount(swapQuote.fees.liquidity, this.getQuoteAssetDecimals(feeAsset)),
          feeAsset,
        ),
        totalFee: new CryptoAmount(baseAmount(swapQuote.fees.total, this.getQuoteAssetDecimals(feeAsset)), feeAsset),
      },
      expiry: swapQuote.expiry,
      recommendedMinAmountIn: new CryptoAmount(
        baseAmount(swapQuote.recommended_min_amount_in || '0', this.getQuoteAssetDecimals(fromAsset)),
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
      warning: swapQuote.warning || '',
    }
  }

  public getDustValues(): Record<string, AssetCryptoAmount> {
    // TODO: Find out how to fetch native asset decimals
    return {
      [BtcChain]: new AssetCryptoAmount(baseAmount(10000, 8), BtcAsset),
      [EthChain]: new AssetCryptoAmount(baseAmount(0, 18), EthAsset),
      [DashChain]: new AssetCryptoAmount(baseAmount(10000, 8), DashAsset),
      [ThorChain]: new AssetCryptoAmount(baseAmount(0, 8), RuneAsset),
      [MayaChain]: new AssetCryptoAmount(baseAmount(0, 10), CacaoAsset),
      [ArbChain]: new AssetCryptoAmount(baseAmount(0, 18), ArbAsset),
      [ZecChain]: new AssetCryptoAmount(baseAmount(10000, 8), ZecAsset),
      // 1 ADA in lovelace (6 decimals); matches MAYAChain's 1 ADA inbound minimum.
      [AdaChain]: new AssetCryptoAmount(baseAmount(1000000, 6), AdaAsset),
    }
  }

  public getChainDustValue(chain: string): AssetCryptoAmount {
    const dustValue = this.getDustValues()[chain]
    if (!dustValue) throw Error(`No dust value known for ${chain} chain`)
    return dustValue
  }

  public async getMAYANameDetails(MAYAName: string): Promise<MAYANameDetails | undefined> {
    const details = await this.mayachainCache.midgardQuery.getMAYANameDetails(MAYAName)
    if (!details) return undefined

    return {
      name: MAYAName,
      owner: details.owner,
      expireBlockHeight: Number(details.expire),
      preferredAsset: details.preferred_asset || '',
      affiliateCollectorCacao: '0',
      aliases: details.entries,
    }
  }

  public async getInboundDetails(): Promise<Record<string, InboundDetail>> {
    return this.mayachainCache.getInboundDetails()
  }

  public async getChainInboundDetails(chain: string): Promise<InboundDetail> {
    const inboundDetails = await this.getInboundDetails()
    if (!inboundDetails[chain]) throw Error(`No inbound details known for ${chain} chain`)
    return inboundDetails[chain]
  }

  public async getAssetDecimals(asset: CompatibleAsset): Promise<number> {
    if (isSynthAsset(asset)) return DEFAULT_MAYACHAIN_DECIMALS

    const assetNotation = assetToString(asset)

    try {
      const assetsDecimals = await this.mayachainCache.getAssetDecimals()
      if (assetsDecimals[assetNotation] !== undefined) return assetsDecimals[assetNotation]
      const upper = assetNotation.toUpperCase()
      const key = Object.keys(assetsDecimals).find((candidate) => candidate.toUpperCase() === upper)
      if (key !== undefined && assetsDecimals[key] !== undefined) return assetsDecimals[key]

      console.warn(`No decimal mapping found for ${assetNotation}, using chain default`)
      return this.getChainDefaultDecimals(asset.chain)
    } catch (error) {
      console.warn(`Failed to get asset decimals for ${assetNotation}, using chain default:`, error)
      return this.getChainDefaultDecimals(asset.chain)
    }
  }

  private getChainDefaultDecimals(chain: string): number {
    const chainDefaults: Record<string, number> = {
      BTC: 8,
      ETH: 18,
      ARB: 18,
      THOR: 8,
      MAYA: 10,
      DASH: 8,
      ZEC: 8,
      ADA: 6,
    }

    return chainDefaults[chain] || 8
  }

  public async getPools(): Promise<PoolDetail[]> {
    return this.mayachainCache.getPools()
  }

  public async getSwapHistory({ addresses }: SwapHistoryParams): Promise<SwapsHistory> {
    const actionsResume = await this.mayachainCache.midgardQuery.getActions({
      address: addresses.join(','),
      type: 'swap',
    })
    const assetDecimals = await this.mayachainCache.getAssetDecimals()
    const poolDetails = await this.mayachainCache.getPools()

    const getCryptoAmount = (
      assetDecimals: Record<string, number>,
      asset: string,
      amount: string,
    ): CryptoAmount<CompatibleAsset> => {
      const decimals = asset in assetDecimals ? assetDecimals[asset] : DEFAULT_MAYACHAIN_DECIMALS
      const validDecimals = typeof decimals === 'number' && decimals >= 0 ? decimals : DEFAULT_MAYACHAIN_DECIMALS
      const assetFormatted = assetFromStringEx(asset) as CompatibleAsset
      return validDecimals === DEFAULT_MAYACHAIN_DECIMALS || eqAsset(CacaoAsset, assetFormatted)
        ? new CryptoAmount(baseAmount(amount, validDecimals), assetFormatted)
        : getCryptoAmountWithNotation(new CryptoAmount(baseAmount(amount), assetFormatted), validDecimals)
    }

    return {
      count: actionsResume.count ? Number(actionsResume.count) : 0,
      swaps: actionsResume.actions
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
          const toAsset: CompatibleAsset = this.getAssetFromMemo(
            (action.metadata.swap as SwapMetadata).memo,
            poolDetails,
          )

          if (action.status === 'pending') {
            return {
              date: new Date(Number(action.date) / 10 ** 6),
              status: 'pending',
              fromAsset,
              toAsset,
              inboundTx,
            }
          }

          const transaction: Transaction = action.out
            .filter((out) => out.coins[0].asset === assetToString(toAsset))
            .sort((out1, out2) => Number(out2.coins[0].amount) - Number(out1.coins[0].amount))[0]

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

  private getAssetFromMemo(memo: string, pools: PoolDetail[]): CompatibleAsset {
    const getAssetFromAliasIfNeeded = (alias: string, pools: PoolDetail[]): string => {
      let delimiter: string = TOKEN_ASSET_DELIMITER

      if (alias.includes(TRADE_ASSET_DELIMITER)) {
        delimiter = TRADE_ASSET_DELIMITER
      } else if (alias.includes(SYNTH_ASSET_DELIMITER)) {
        delimiter = SYNTH_ASSET_DELIMITER
      }

      const splitedAlias = alias.split(delimiter)
      const pool = pools.find((pool) => pool.asset.includes(`${splitedAlias[0]}.${splitedAlias[1].split('-')[0]}`))

      if (pool) return pool.asset.replace('.', delimiter)

      return alias
    }

    const attributes = memo.split(':')
    if (!attributes[0]) throw Error(`Invalid memo: ${memo}`)

    switch (attributes[0]) {
      case 'SWAP':
      case '=':
        if (!attributes[1]) throw Error('Asset not defined')
        return assetFromStringEx(getAssetFromAliasIfNeeded(attributes[1], pools)) as CompatibleAsset
      default:
        throw Error(`Get asset from memo unsupported for ${attributes[0]} operation`)
    }
  }
  public async getMAYANamesByOwner(owner: Address): Promise<MAYANameDetails[]> {
    const mayaNames = await this.mayachainCache.midgardQuery.getMAYANameReverseLookup(owner)

    if (!mayaNames || mayaNames.length === 0) return []

    const tasks = mayaNames.map((mayaName) => this.getMAYANameDetails(mayaName))

    const mayaNamesDetails = await Promise.all(tasks)
    return mayaNamesDetails.filter((mayaNameDetails) => mayaNameDetails !== undefined) as MAYANameDetails[]
  }

  public async estimateMAYAName({
    name,
    owner,
    isUpdate,
    expiry,
    chain,
    chainAddress,
    preferredAsset,
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

    const constantsDetails = await this.mayachainCache.mayanode.getMimir()
    const assetDecimals = await this.mayachainCache.getAssetDecimals()
    const oneTimeFee = isUpdate
      ? baseAmount(0, assetDecimals[assetToString(CacaoAsset)])
      : baseAmount(constantsDetails['TNSREGISTERFEE'], assetDecimals[assetToString(CacaoAsset)])

    const totalFeePerBlock = baseAmount(
      constantsDetails['TNSFEEPERBLOCK'],
      assetDecimals[assetToString(CacaoAsset)],
    ).times(numberOfBlocksToAddToExpiry > 0 ? numberOfBlocksToAddToExpiry : 0)

    const txFee = baseAmount(constantsDetails['NATIVETRANSACTIONFEE'], assetDecimals[assetToString(CacaoAsset)])

    return {
      value: new AssetCryptoAmount(oneTimeFee.plus(totalFeePerBlock).plus(txFee), CacaoAsset),
      memo: `~:${name}:${isUpdate ? chain || details?.aliases[0].chain : chain}:${
        isUpdate ? chainAddress || details?.aliases[0].address : chainAddress
      }:${isUpdate ? owner || details?.owner : owner}:${
        preferredAsset ? assetToString(preferredAsset) : isUpdate ? '' : 'MAYA.CACAO'
      }`,
    }
  }

  public async getTradeAssetUnits({ asset, height }: TradeAssetUnitsParams): Promise<TradeAssetUnits> {
    const assetString = assetToString(asset)
    const response = await this.mayachainCache.mayanode.getTradeAssetUnits(assetString, height)

    return {
      asset,
      units: new TradeCryptoAmount(baseAmount(response.units), asset),
      depth: new TradeCryptoAmount(baseAmount(response.depth), asset),
    }
  }

  public async getTradeAssetsUnits({ height }: TradeAssetsUnitsParams = {}): Promise<TradeAssetUnits[]> {
    const response = await this.mayachainCache.mayanode.getTradeAssetsUnits(height)

    return response.map((item) => {
      const asset = assetFromStringEx(item.asset) as TradeAsset
      return {
        asset,
        units: new TradeCryptoAmount(baseAmount(item.units), asset),
        depth: new TradeCryptoAmount(baseAmount(item.depth), asset),
      }
    })
  }

  public async getAddressTradeAccounts({ address, height }: AddressTradeAccountsParams): Promise<AddressTradeAccounts> {
    const response = await this.mayachainCache.mayanode.getTradeAssetAccount(address, height)

    return response.map((item) => {
      const asset = assetFromStringEx(item.asset) as TradeAsset
      return {
        asset,
        units: new TradeCryptoAmount(baseAmount(item.units), asset),
        owner: item.owner,
        lastAddHeight: item.last_add_height,
        lastWithdrawHeight: item.last_withdraw_height,
      }
    })
  }

  public async getTradeAssetAccounts({ asset, height }: TradeAssetAccountsParams): Promise<TradeAssetAccounts> {
    const assetString = assetToString(asset)
    const response = await this.mayachainCache.mayanode.getTradeAssetAccounts(assetString, height)

    return response.map((item) => {
      const tradeAsset = assetFromStringEx(item.asset) as TradeAsset
      return {
        asset: tradeAsset,
        units: new TradeCryptoAmount(baseAmount(item.units), tradeAsset),
        owner: item.owner,
        lastAddHeight: item.last_add_height,
        lastWithdrawHeight: item.last_withdraw_height,
      }
    })
  }

  // Cacao 10, Maya 4, other assets 8
  private getQuoteAssetDecimals(asset: CompatibleAsset): number {
    if (eqAsset(asset, CacaoAsset)) return CACAO_DECIMAL
    if (eqAsset(asset, MayaAsset)) return MAYA_DECIMAL
    return DEFAULT_MAYACHAIN_DECIMALS
  }
}
