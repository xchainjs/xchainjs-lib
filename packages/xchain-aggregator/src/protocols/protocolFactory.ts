import { Config, IProtocol, Protocol, ProtocolConfig } from '../types'

import { ChainflipProtocol } from './chainflip'
import { MayachainProtocol } from './mayachain'
import { ThorchainProtocol } from './thorchain'

const getProtocolConfig = (name: Protocol, configuration: Config): ProtocolConfig => {
  return {
    wallet: configuration.wallet,
    affiliateAddress: configuration.affiliate?.affiliates[name],
    affiliateBps: configuration.affiliate?.affiliates[name] ? configuration.affiliate.basisPoints : undefined,
  }
}

export class ProtocolFactory {
  static getProtocol(name: Protocol, configuration: Config): IProtocol {
    const protocolConfig = getProtocolConfig(name, configuration)
    switch (name) {
      case 'Thorchain':
        return new ThorchainProtocol(protocolConfig)
      case 'Mayachain':
        return new MayachainProtocol(protocolConfig)
      case 'Chainflip':
        return new ChainflipProtocol(protocolConfig)
    }
  }
}
