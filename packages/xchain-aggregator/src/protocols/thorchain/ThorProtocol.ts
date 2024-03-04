import { TxSubmitted } from '@xchainjs/xchain-thorchain-amm'
import { Asset } from '@xchainjs/xchain-util'

import { IProtocol, QuoteSwap } from '../../types'

export class ThorProtocol implements IProtocol {
  isAssetSupported(asset: Asset): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  estimateSwap(params: QuoteSwap): Promise<QuoteSwap> {
    throw new Error('Method not implemented.')
  }
  validateSwap(params: QuoteSwap): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  doSwap(params: QuoteSwap): Promise<TxSubmitted> {
    throw new Error('Method not implemented.')
  }
}
