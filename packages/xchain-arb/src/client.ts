import { Client as XchainEvmClient } from '@xchainjs/xchain-evm'

import { defaultArbParams } from './const'

export default class Client extends XchainEvmClient {
  constructor(config = defaultArbParams) {
    super(config)
  }
}
export { Client }
