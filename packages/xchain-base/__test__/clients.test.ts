import { Network } from '@xchainjs/xchain-client'
import { assetToString } from '@xchainjs/xchain-util'

import { Client, defaultBaseParams } from '../src/index'

describe('Base client', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      ...defaultBaseParams,
      phrase: process.env.PHRASE_MAINNET,
    })
  })

  describe('Asset', () => {
    it('Should get native asset', () => {
      const assetInfo = client.getAssetInfo()
      expect(assetToString(assetInfo.asset)).toBe('BASE.ETH')
      expect(assetInfo.decimal).toBe(18)
    })
  })

  describe('Addresses', () => {
    it('Should validate address as valid', () => {
      expect(client.validateAddress('0x007ab5199b6c57f7aa51bc3d0604a43505501a0c')).toBeTruthy()
    })

    it('Should validate address as invalid', () => {
      expect(client.validateAddress('fakeAddress')).toBeFalsy()
    })
  })
  describe('Explorers', () => {
    describe('Mainnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client()
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://basescan.org/')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('DkyQEQYdZ61vrRpPUHyyDNz9NBCcvVxSQjBqBcJvGdFT')).toBe(
          'https://basescan.org/address/DkyQEQYdZ61vrRpPUHyyDNz9NBCcvVxSQjBqBcJvGdFT',
        )
      })
      it('Should get transaction url', () => {
        expect(
          client.getExplorerTxUrl(
            'qnZzcK9tWBtgTbSirrCKZ59AYmZa6Dr9qQ6Ned1a4hxa171wevawknoyiBUz9cu3HssUw9W11JRVTFtwwJo3mxS',
          ),
        ).toBe(
          'https://basescan.org/tx/qnZzcK9tWBtgTbSirrCKZ59AYmZa6Dr9qQ6Ned1a4hxa171wevawknoyiBUz9cu3HssUw9W11JRVTFtwwJo3mxS',
        )
      })
    })
    describe('Testnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          ...defaultBaseParams,
          network: Network.Testnet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://sepolia.basescan.org')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('AKYxN3oot9NTMq1W1eG1nHD4BaVnhR8rsYzDcqpkWSjD')).toBe(
          'https://sepolia.basescan.org/address/AKYxN3oot9NTMq1W1eG1nHD4BaVnhR8rsYzDcqpkWSjD',
        )
      })
      it('Should get transaction url', () => {
        expect(
          client.getExplorerTxUrl(
            'rAzjs4YRHHm6qSGe3EZzfwfW4WUpDx6RyK11iPL752Z1nAzGQCdxdCbSo6ZDKdwYZXuPojE1fwtirGjVvLLXPub',
          ),
        ).toBe(
          'https://sepolia.basescan.org/tx/rAzjs4YRHHm6qSGe3EZzfwfW4WUpDx6RyK11iPL752Z1nAzGQCdxdCbSo6ZDKdwYZXuPojE1fwtirGjVvLLXPub',
        )
      })
    })
  })
})
