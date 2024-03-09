import { assetToString } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { MayachainProtocol, ThorchainProtocol } from './protocols'
import { IProtocol, QuoteSwap, QuoteSwapParams } from './types'

// Class definition for an Aggregator
export class Aggregator {
  private protocols: IProtocol[]

  constructor(wallet?: Wallet) {
    this.protocols = [new ThorchainProtocol(wallet), new MayachainProtocol(wallet)]
  }

  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap> {
    const estimateTask = async (protocol: IProtocol, params: QuoteSwapParams) => {
      const [isFromAssetSupported, isDestinationAssetSupported] = await Promise.all([
        protocol.isAssetSupported(params.fromAsset),
        protocol.isAssetSupported(params.destinationAsset),
      ])
      if (!isFromAssetSupported) throw Error(`${assetToString(params.fromAsset)} not supported in ${protocol.name}`)
      if (!isDestinationAssetSupported)
        throw Error(`${assetToString(params.destinationAsset)} not supported in ${protocol.name}`)

      return protocol.estimateSwap(params)
    }

    const results = await Promise.allSettled(this.protocols.map((protocol) => estimateTask(protocol, params)))

    let optimalSwap: QuoteSwap | undefined

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (!optimalSwap || result.value.expectedAmount.assetAmount.gte(optimalSwap.expectedAmount.assetAmount))
          optimalSwap = result.value
      }
    })

    if (!optimalSwap)
      throw Error(`Can not estimate swap from ${assetToString(params.fromAsset)} to ${assetToString(params.fromAsset)}`)

    return optimalSwap
  }
}
