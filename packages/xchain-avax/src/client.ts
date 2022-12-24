import { Client as XchainEvmClient } from '@xchainjs/xchain-evm'

import { defaultAvaxParams } from './const'

export default class Client extends XchainEvmClient {
  constructor(config = defaultAvaxParams) {
    super(config)
  }
}
export { Client }
