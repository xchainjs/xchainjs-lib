import * as bchData from './coins/bch'
import * as dashData from './coins/dash'
import * as dogeData from './coins/doge'
import * as ltcData from './coins/ltc'

interface CoinVersion {
  bip32: {
    public: number
    private: number
  }
  bip44?: number
  private: number
  public: number
  scripthash: number
}

interface CoinConfig {
  name: string
  unit: string
  hashGenesisBlock?: string
  port?: number
  protocol?: {
    magic: number
  }
  seedsDns?: string[]
  versions: CoinVersion
  messagePrefix?: string
  bech32?: string
  testnet?: boolean
}

interface CoinData {
  main: CoinConfig
  test?: CoinConfig
  regtest?: CoinConfig
  simnet?: CoinConfig
}

function toBitcoinJSInner(coinConfig: CoinConfig) {
  return {
    messagePrefix: coinConfig.messagePrefix || '\x19' + coinConfig.name + ' Signed Message:\n',
    bech32: coinConfig.bech32,
    bip32: {
      public: (coinConfig.versions.bip32 || {}).public,
      private: (coinConfig.versions.bip32 || {}).private,
    },
    pubKeyHash: coinConfig.versions.public,
    scriptHash: coinConfig.versions.scripthash,
    wif: coinConfig.versions.private,
  }
}

const coinConfigs: Record<string, CoinData> = {
  bitcoincash: bchData,
  dogecoin: dogeData,

  dash: dashData,
  litecoin: ltcData,
}

export function toBitcoinJS(chain: 'bitcoincash' | 'dogecoin' | 'dash' | 'litecoin', network: 'main' | 'test') {
  const coinData = coinConfigs[chain]
  if (!coinData) {
    throw new Error(`Coin data for ${chain} not found`)
  }

  const config = network === 'main' ? coinData.main : coinData.test
  if (!config) {
    throw new Error(`Network ${network} not found for ${chain}`)
  }

  return toBitcoinJSInner(config)
}
