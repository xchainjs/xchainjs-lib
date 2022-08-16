import { Client as XchainEvmClient, EVMClientParams } from '@xchainjs/xchain-evm'

export default class Client extends XchainEvmClient {
  constructor(config: EVMClientParams) {
    super(config)
  }
}
export { Client }
