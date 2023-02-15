import { Client as XchainEvmClient } from '@xchainjs/xchain-evm'

import { defaultBscParams } from './const'

export default class Client extends XchainEvmClient {
  constructor(config = defaultBscParams) {
    super(config)
  }
}
export { Client }
