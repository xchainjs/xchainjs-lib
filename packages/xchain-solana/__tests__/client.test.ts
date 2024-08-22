import { Network } from '@xchainjs/xchain-client'

import { Client, defaultSolanaParams } from '../src'

describe('Solana client', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      ...defaultSolanaParams,
      phrase: process.env.PHRASE_MAINNET,
    })
  })

  it('Should validate address as valid', () => {
    expect(client.validateAddress('G72oBA9cRYUzR8Q9oLvJcNRx5ovcDGFvHsbZKp1BT75W')).toBeTruthy()
  })

  it('Should validate address as invalid', () => {
    expect(client.validateAddress('fakeAddress')).toBeFalsy()
  })

  describe('Explorers', () => {
    describe('Mainnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client()
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://explorer.solana.com/')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('DkyQEQYdZ61vrRpPUHyyDNz9NBCcvVxSQjBqBcJvGdFT')).toBe(
          'https://explorer.solana.com/address/DkyQEQYdZ61vrRpPUHyyDNz9NBCcvVxSQjBqBcJvGdFT',
        )
      })
      it('Should get transaction url', () => {
        expect(
          client.getExplorerTxUrl(
            'qnZzcK9tWBtgTbSirrCKZ59AYmZa6Dr9qQ6Ned1a4hxa171wevawknoyiBUz9cu3HssUw9W11JRVTFtwwJo3mxS',
          ),
        ).toBe(
          'https://explorer.solana.com/tx/qnZzcK9tWBtgTbSirrCKZ59AYmZa6Dr9qQ6Ned1a4hxa171wevawknoyiBUz9cu3HssUw9W11JRVTFtwwJo3mxS',
        )
      })
    })
    describe('Testnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          ...defaultSolanaParams,
          network: Network.Testnet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://explorer.solana.com/?cluster=testnet')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('AKYxN3oot9NTMq1W1eG1nHD4BaVnhR8rsYzDcqpkWSjD')).toBe(
          'https://explorer.solana.com/address/AKYxN3oot9NTMq1W1eG1nHD4BaVnhR8rsYzDcqpkWSjD?cluster=testnet',
        )
      })
      it('Should get transaction url', () => {
        expect(
          client.getExplorerTxUrl(
            'rAzjs4YRHHm6qSGe3EZzfwfW4WUpDx6RyK11iPL752Z1nAzGQCdxdCbSo6ZDKdwYZXuPojE1fwtirGjVvLLXPub',
          ),
        ).toBe(
          'https://explorer.solana.com/tx/rAzjs4YRHHm6qSGe3EZzfwfW4WUpDx6RyK11iPL752Z1nAzGQCdxdCbSo6ZDKdwYZXuPojE1fwtirGjVvLLXPub?cluster=testnet',
        )
      })
    })
    describe('Stagenet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          ...defaultSolanaParams,
          network: Network.Stagenet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://explorer.solana.com/')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('DkyQEQYdZ61vrRpPUHyyDNz9NBCcvVxSQjBqBcJvGdFT')).toBe(
          'https://explorer.solana.com/address/DkyQEQYdZ61vrRpPUHyyDNz9NBCcvVxSQjBqBcJvGdFT',
        )
      })
      it('Should get transaction url', () => {
        expect(
          client.getExplorerTxUrl(
            'qnZzcK9tWBtgTbSirrCKZ59AYmZa6Dr9qQ6Ned1a4hxa171wevawknoyiBUz9cu3HssUw9W11JRVTFtwwJo3mxS',
          ),
        ).toBe(
          'https://explorer.solana.com/tx/qnZzcK9tWBtgTbSirrCKZ59AYmZa6Dr9qQ6Ned1a4hxa171wevawknoyiBUz9cu3HssUw9W11JRVTFtwwJo3mxS',
        )
      })
    })
  })
})
