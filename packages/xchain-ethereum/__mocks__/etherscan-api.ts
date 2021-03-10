import nock from 'nock'
import { ETHTransactionInfo, TokenTransactionInfo, GasOracleResponse } from '../src/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mock_etherscan_api = (url: string, method: string, result: any) => {
  nock(url)
    .get('/api')
    .query((param) => param.module === 'proxy' && param.action === method)
    .reply(200, {
      jsonrpc: '2.0',
      result,
      id: 1,
    })
}
export const mock_gastracker_api = (url: string, method: string, result: GasOracleResponse) => {
  nock(url)
    .get('/api')
    .query((param) => param.module === 'gastracker' && param.action === method)
    .reply(200, {
      jsonrpc: '2.0',
      result,
      id: 1,
    })
}

export const mock_etherscan_balance_api = (url: string, result: string) => {
  nock(url)
    .get('/api')
    .query((param) => {
      return param.module === 'account' && param.action === 'balance'
    })
    .reply(200, {
      status: '1',
      message: 'OK',
      result,
    })
}

export const mock_etherscan_tokenbalance_api = (url: string, result: string) => {
  nock(url)
    .get('/api')
    .query((param) => {
      return param.module === 'account' && param.action === 'tokenbalance'
    })
    .reply(200, {
      status: '1',
      message: 'OK',
      result,
    })
}

export const mock_etherscan_eth_txs_api = (url: string, result: ETHTransactionInfo[]) => {
  nock(url)
    .get('/api')
    .query((param) => {
      return param.module === 'account' && param.action === 'txlist'
    })
    .reply(200, {
      status: '1',
      message: 'OK',
      result,
    })
}

export const mock_etherscan_token_txs_api = (url: string, result: TokenTransactionInfo[]) => {
  nock(url)
    .get('/api')
    .query((param) => {
      return param.module === 'account' && param.action === 'tokentx'
    })
    .reply(200, {
      status: '1',
      message: 'OK',
      result,
    })
}
