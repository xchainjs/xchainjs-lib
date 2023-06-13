import { Client as XchainEvmClient } from '@xchainjs/xchain-evm'

import { defaultEthParams } from './const'

export default class Client extends XchainEvmClient {
  constructor(config = defaultEthParams) {
    super(config)
  }
}
export { Client }
