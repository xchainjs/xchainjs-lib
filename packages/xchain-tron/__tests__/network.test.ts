import { Network } from '@xchainjs/xchain-client'

import { Client, defaultTRONParams } from '../src'
import {
  TRON_DEFAULT_RPC,
  TRON_NILE_RPC,
  TRON_NILE_USDT_CONTRACT,
  TRON_USDT_CONTRACT,
  TRONGRID_API_BASE_URL,
  getTronUsdtContract,
} from '../src/const'

const hosts = (client: Client) => {
  const inner = client as unknown as {
    tronWeb: { fullNode: { host: string } }
    tronGrid: { apiBaseUrl: string; tronWeb: { fullNode: { host: string } } }
  }
  return {
    rpc: inner.tronWeb.fullNode.host,
    trongrid: inner.tronGrid.apiBaseUrl,
    gridRpc: inner.tronGrid.tronWeb.fullNode.host,
  }
}

describe('Tron network endpoints', () => {
  it('keeps mainnet on the public node and TronGrid', () => {
    const client = new Client({ ...defaultTRONParams, network: Network.Mainnet })
    expect(hosts(client)).toEqual({
      rpc: TRON_DEFAULT_RPC,
      trongrid: TRONGRID_API_BASE_URL,
      gridRpc: TRON_DEFAULT_RPC,
    })
    expect(getTronUsdtContract(Network.Mainnet)).toBe(TRON_USDT_CONTRACT)
  })

  it('keeps stagenet on mainnet', () => {
    const client = new Client({ ...defaultTRONParams, network: Network.Stagenet })
    expect(hosts(client).rpc).toBe(TRON_DEFAULT_RPC)
    expect(hosts(client).trongrid).toBe(TRONGRID_API_BASE_URL)
    expect(getTronUsdtContract(Network.Stagenet)).toBe(TRON_USDT_CONTRACT)
  })

  it('points testnet at Nile', () => {
    const client = new Client({ ...defaultTRONParams, network: Network.Testnet })
    expect(hosts(client)).toEqual({
      rpc: TRON_NILE_RPC,
      trongrid: TRON_NILE_RPC,
      gridRpc: TRON_NILE_RPC,
    })
    expect(getTronUsdtContract(Network.Testnet)).toBe(TRON_NILE_USDT_CONTRACT)
  })

  it('follows setNetwork onto Nile and back', () => {
    const client = new Client({ ...defaultTRONParams, network: Network.Mainnet })
    client.setNetwork(Network.Testnet)
    expect(hosts(client).rpc).toBe(TRON_NILE_RPC)
    expect(hosts(client).trongrid).toBe(TRON_NILE_RPC)
    client.setNetwork(Network.Mainnet)
    expect(hosts(client).rpc).toBe(TRON_DEFAULT_RPC)
    expect(hosts(client).trongrid).toBe(TRONGRID_API_BASE_URL)
  })
})
