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

describe('default BSC RPC', () => {
  it('uses the public dataseed when ANKR_API_KEY is unset', () => {
    withAnkrKey(undefined, () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { defaultBscParams } = require('../src/const')
      expect(rpcUrl(defaultBscParams.providers[Network.Mainnet])).toBe('https://bsc-dataseed.binance.org')
      expect(rpcUrl(defaultBscParams.providers[Network.Stagenet])).toBe('https://bsc-dataseed.binance.org')
      expect(rpcUrl(defaultBscParams.providers[Network.Testnet])).toBe('https://bsc-testnet.public.blastapi.io')
    })
  })

  it('uses Ankr when ANKR_API_KEY is set', () => {
    withAnkrKey('test-key', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { defaultBscParams } = require('../src/const')
      expect(rpcUrl(defaultBscParams.providers[Network.Mainnet])).toBe('https://rpc.ankr.com/bsc/test-key')
    })
  })

  it('treats an empty ANKR_API_KEY as unset', () => {
    withAnkrKey('', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { defaultBscParams } = require('../src/const')
      expect(rpcUrl(defaultBscParams.providers[Network.Mainnet])).toBe('https://bsc-dataseed.binance.org')
    })
  })
})
