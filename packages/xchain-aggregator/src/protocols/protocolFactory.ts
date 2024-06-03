import { Wallet } from '@xchainjs/xchain-wallet'

import { IProtocol, Protocol } from '../types'

import { ChainflipProtocol } from './chainflip'
import { MayachainProtocol } from './mayachain'
import { ThorchainProtocol } from './thorchain'

export class ProtocolFactory {
  static getProtocol(name: Protocol, wallet?: Wallet): IProtocol {
    switch (name) {
      case 'Thorchain':
        return new ThorchainProtocol(wallet)
      case 'Mayachain':
        return new MayachainProtocol(wallet)
      case 'Chainflip':
        return new ChainflipProtocol(wallet)
    }
  }

  static getAllProtocols(wallet?: Wallet): IProtocol[] {
    return [new ThorchainProtocol(wallet), new MayachainProtocol(wallet), new ChainflipProtocol(wallet)]
  }
}
