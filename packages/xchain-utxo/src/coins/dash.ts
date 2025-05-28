/*
  info from:
    https://github.com/dashpay/dash/blob/master/src/chainparams.cpp
*/

const common = {
  name: 'Dash',
  unit: 'DASH',
}

const main = Object.assign(
  {},
  {
    hashGenesisBlock: '00000ffd590b1485b3caadc19b22e6379c733355108f107a430458cdf3407ab6',
    // nDefaultPort
    port: 9999,
    portRpc: 9998,
    protocol: {
      magic: 0xbd6b0cbf, // careful, sent over wire as little endian
    },
    // vSeeds
    seedsDns: [
      'dash.org',
      'dnsseed.dash.org',
      'dashdot.io',
      'dnsseed.dashdot.io',
      'masternode.io',
      'dnsseed.masternode.io',
      'dashpay.io',
      'dnsseed.dashpay.io',
    ],
    // base58Prefixes
    versions: {
      bip32: {
        private: 0x0488ade4,
        public: 0x0488b21e,
      },
      bip44: 5,
      private: 0xcc,
      public: 0x4c,
      scripthash: 0x10,
    },
  },
  common,
)

const test = Object.assign(
  {},
  {
    hashGenesisBlock: '00000bafbc94add76cb75e2ec92894837288a481e5c005f6563d91623bf8bc2c',
    port: 19999,
    portRpc: 19998,
    seedsDns: ['dashdot.io', 'testnet-seed.dashdot.io', 'masternode.io', 'test.dnsseed.masternode.io'],
    versions: {
      bip32: {
        private: 0x04358394,
        public: 0x043587cf,
      },
      bip44: 1,
      private: 0xef,
      public: 0x8c,
      scripthash: 0x13,
    },
  },
  common,
)

export { main, test }
