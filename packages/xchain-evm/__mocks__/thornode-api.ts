import { Chain } from '@xchainjs/xchain-util'
import nock from 'nock'

type InboundAddress = {
  chain: Chain
  pub_key: string
  address: string
  halted: boolean
  gas_rate: string
  router?: string
}

type MimirDetails = {
  HALTTRADING: number
  HALTETHTRADING: number
  HALTETHCHAIN: number
}

export const mock_thornode_inbound_addresses_success = (url: string, result: InboundAddress[]) => {
  nock(url)
    .get(`/thorchain/inbound_addresses`)
    .query((_) => true)
    .reply(200, result)
}

export const mock_thornode_inbound_addresses_fail = (url: string) => {
  nock(url)
    .get(`/thorchain/inbound_addresses`)
    .query((_) => true)
    .reply(500, {
      error: 'somthing bad happened',
    })
}

export const mock_thornode_mimir = (url: string, result: MimirDetails) => {
  nock(url)
    .get('/thorchain/mimir')
    .query((_) => true)
    .reply(200, result)
}
