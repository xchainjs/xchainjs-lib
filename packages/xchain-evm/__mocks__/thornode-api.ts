import { Chain } from '@xchainjs/xchain-util'
import mock from './axios-adapter'

type InboundAddress = {
  chain: Chain
  pub_key: string
  address: string
  halted: boolean
  gas_rate: string
  router?: string
}

export const mock_thornode_inbound_addresses_success = (url: string, result: InboundAddress[]) => {
  mock.onGet(new RegExp(`${url}/thorchain/inbound_addresses`)).reply(200, result)
}
