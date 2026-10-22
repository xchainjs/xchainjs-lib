import { Network } from '@xchainjs/xchain-client'
import { JsonRpcProvider } from 'ethers'

const rpcUrl = (provider: JsonRpcProvider): string =>
  (provider as JsonRpcProvider & { _getConnection(): { url: string } })._getConnection().url

const withAnkrKey = (key: string | undefined, run: () => void) => {
  const previous = process.env.ANKR_API_KEY
  if (key === undefined) delete process.env.ANKR_API_KEY
  else process.env.ANKR_API_KEY = key
  try {
    jest.isolateModules(run)
  } finally {
    if (previous === undefined) delete process.env.ANKR_API_KEY
    else process.env.ANKR_API_KEY = previous
  }
}

describe('default Avalanche RPC', () => {
  it('uses the public API when ANKR_API_KEY is unset', () => {
    withAnkrKey(undefined, () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { defaultAvaxParams } = require('../src/const')
      expect(rpcUrl(defaultAvaxParams.providers[Network.Mainnet])).toBe('https://api.avax.network/ext/bc/C/rpc')
      expect(rpcUrl(defaultAvaxParams.providers[Network.Testnet])).toBe('https://api.avax-test.network/ext/bc/C/rpc')
      expect(rpcUrl(defaultAvaxParams.providers[Network.Stagenet])).toBe('https://api.avax.network/ext/bc/C/rpc')
    })
  })

  it('uses Ankr when ANKR_API_KEY is set', () => {
    withAnkrKey('test-key', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { defaultAvaxParams } = require('../src/const')
      expect(rpcUrl(defaultAvaxParams.providers[Network.Mainnet])).toBe('https://rpc.ankr.com/avalanche/test-key')
      expect(rpcUrl(defaultAvaxParams.providers[Network.Testnet])).toBe('https://rpc.ankr.com/avalanche_fuji/test-key')
    })
  })

  it('treats an empty ANKR_API_KEY as unset', () => {
    withAnkrKey('', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { defaultAvaxParams } = require('../src/const')
      expect(rpcUrl(defaultAvaxParams.providers[Network.Mainnet])).toBe('https://api.avax.network/ext/bc/C/rpc')
    })
  })
})
