import { Balance, Network, TxType } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, assetToString, eqAsset } from '@xchainjs/xchain-util'

import { ADAAsset, Client, defaultAdaParams } from '../src'

describe('Cardano client', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      apiKeys: {
        blockfrostApiKeys: [],
      },
    })
  })

  describe('Asset', () => {
    it('Should get native asset', () => {
      const assetInfo = client.getAssetInfo()
      expect(assetToString(assetInfo.asset)).toBe('ADA.ADA')
      expect(assetInfo.decimal).toBe(6)
    })
  })

  describe('Explorers', () => {
    describe('Mainnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          apiKeys: {
            blockfrostApiKeys: [],
          },
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://adastat.net/')
      })
      it('Should get address url', () => {
        expect(
          client.getExplorerAddressUrl(
            'addr1z8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacuyrnkl6qpk3zlnk7qg8xpz7q8s73vmth5u4s2hyc6qtxqqrxvhh',
          ),
        ).toBe(
          'https://adastat.net/addresses/addr1z8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacuyrnkl6qpk3zlnk7qg8xpz7q8s73vmth5u4s2hyc6qtxqqrxvhh',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('f479bd4b1a77a61ce90248065d903ccee8629351132d77fae90cda73731fd0d3')).toBe(
          'https://adastat.net/transactions/f479bd4b1a77a61ce90248065d903ccee8629351132d77fae90cda73731fd0d3',
        )
      })
    })

    describe('Testnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          network: Network.Testnet,
          apiKeys: {
            blockfrostApiKeys: [],
          },
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://preprod.cardanoscan.io/')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('addr_test1vpws8zs83y2egkx28rg9cc97cdr46gsrpu8q8r0w8ylsq3saapj3k')).toBe(
          'https://preprod.cardanoscan.io/address/addr_test1vpws8zs83y2egkx28rg9cc97cdr46gsrpu8q8r0w8ylsq3saapj3k',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('dd941e610df9c7504be85153477012c254a6a5a46bb2142c62dea3f170f13faa')).toBe(
          'https://preprod.cardanoscan.io/transaction/dd941e610df9c7504be85153477012c254a6a5a46bb2142c62dea3f170f13faa',
        )
      })
    })

    describe('Stagenet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          network: Network.Stagenet,
          apiKeys: {
            blockfrostApiKeys: [],
          },
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://adastat.net/')
      })
      it('Should get address url', () => {
        expect(
          client.getExplorerAddressUrl(
            'addr1z8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacuyrnkl6qpk3zlnk7qg8xpz7q8s73vmth5u4s2hyc6qtxqqrxvhh',
          ),
        ).toBe(
          'https://adastat.net/addresses/addr1z8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacuyrnkl6qpk3zlnk7qg8xpz7q8s73vmth5u4s2hyc6qtxqqrxvhh',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('f479bd4b1a77a61ce90248065d903ccee8629351132d77fae90cda73731fd0d3')).toBe(
          'https://adastat.net/transactions/f479bd4b1a77a61ce90248065d903ccee8629351132d77fae90cda73731fd0d3',
        )
      })
    })
  })

  describe('Address', () => {
    describe('Mainnet', () => {
      beforeAll(() => {
        client = new Client({
          ...defaultAdaParams,
          apiKeys: {
            blockfrostApiKeys: [],
          },
        })
      })

      it('Should get address is valid', async () => {
        const address = await client.validateAddress(
          'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhv',
        )
        expect(address).toBeTruthy()
      })
      it('Should get address is not valid', async () => {
        const address = await client.validateAddress(
          'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhf',
        )
        expect(address).toBeFalsy()
      })
    })

    describe('Stagenet', () => {
      beforeAll(() => {
        client = new Client({
          apiKeys: {
            blockfrostApiKeys: [],
          },
          network: Network.Stagenet,
        })
      })

      it('Should get address is valid', async () => {
        const address = await client.validateAddress(
          'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhv',
        )
        expect(address).toBeTruthy()
      })
      it('Should get address is not valid', async () => {
        const address = await client.validateAddress(
          'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhf',
        )
        expect(address).toBeFalsy()
      })
    })

    describe('Testnet', () => {
      beforeAll(() => {
        client = new Client({
          apiKeys: {
            blockfrostApiKeys: [],
          },
          network: Network.Testnet,
        })
      })

      it('Should get address is valid', async () => {
        const address = await client.validateAddress(
          'addr_test1qpkjqjg3yfql7uspafzanp0xq4fvuqzgyewhqhcqnk94w4gk9jlajcx98yc9g8rxgw0zrdsprlkkjl4l2s9ls6hvxlsq3n089y',
        )
        expect(address).toBeTruthy()
      })
      it('Should get address is not valid', async () => {
        const address = await client.validateAddress(
          'addr_test1qpkjqjg3yfql7uspafzanp0xq4fvuqzgyewhqhcqnk94w4gk9jlajcx98yc9g8rxgw0zrdsprlkkjl4l2s9ls6hvxlsq3n089s',
        )
        expect(address).toBeFalsy()
      })
    })
  })

  describe('Balance', () => {
    let client: Client
    beforeAll(() => {
      client = new Client({
        ...defaultAdaParams,
        apiKeys: {
          blockfrostApiKeys: [
            {
              mainnet: 'fakeApiKey',
              testnet: '',
              stagenet: '',
            },
          ],
        },
      })
    })

    it('Should get native balance for address with balance', async () => {
      const balances = await client.getBalance(
        'addr1zyq0kyrml023kwjk8zr86d5gaxrt5w8lxnah8r6m6s4jp4g3r6dxnzml343sx8jweqn4vn3fz2kj8kgu9czghx0jrsyqqktyhv',
      )
      expect(balances.some((balance) => eqAsset(balance.asset, ADAAsset))).toBeTruthy()
    })

    it('Should get native balance for address with no balance', async () => {
      const balances = await client.getBalance(
        'addr1q9kjqjg3yfql7uspafzanp0xq4fvuqzgyewhqhcqnk94w4gk9jlajcx98yc9g8rxgw0zrdsprlkkjl4l2s9ls6hvxlsqj9j8fm',
      )
      expect(balances.some((balance) => eqAsset(balance.asset, ADAAsset))).toBeTruthy()
    })

    it('Should get native balance in correct format', async () => {
      const balances = await client.getBalance(
        'addr1zyq0kyrml023kwjk8zr86d5gaxrt5w8lxnah8r6m6s4jp4g3r6dxnzml343sx8jweqn4vn3fz2kj8kgu9czghx0jrsyqqktyhv',
      )
      const balance = balances.find((balance) => eqAsset(balance.asset, ADAAsset))
      expect(balance).toBeDefined()
      const adaBalance = balance as Balance
      expect(assetToString(adaBalance.asset)).toEqual('ADA.ADA')
      expect(adaBalance.amount.decimal).toEqual(6)
      expect(adaBalance.amount.amount().toString()).toEqual('133884551384')
    })
  })

  describe('Transaction', () => {
    let client: Client
    beforeAll(() => {
      client = new Client({
        ...defaultAdaParams,
        apiKeys: {
          blockfrostApiKeys: [
            {
              mainnet: 'fakeApiKey',
              testnet: '',
              stagenet: '',
            },
          ],
        },
      })
    })

    it('Should get native transaction data', async () => {
      const tx = await client.getTransactionData('6b8cf522fd97792bbe0cb03a1c057ac41c5e26338a31515c2c022cb0bee9f2a2')
      expect(tx.type).toBe(TxType.Transfer)
      expect(tx.hash).toBe('6b8cf522fd97792bbe0cb03a1c057ac41c5e26338a31515c2c022cb0bee9f2a2')
      expect(tx.date.getTime()).toBe(1720535411000)
      expect(assetToString(tx.asset)).toBe('ADA.ADA')
      expect(tx.from.length).toBe(1)
      expect(tx.from[0].from).toBe(
        'addr1q88p8j5jgpujpf33l5ja2rreearp3x9x59ju65hxkhu29jvctwav0g4zrrmq388yc7h22qehlyt4y556atrty5sfdq5q7plfz5',
      )
      expect(tx.from[0].amount.amount().toString()).toBe('69382438882275')
      expect(tx.from[0].asset ? assetToString(tx.from[0].asset) : undefined).toBe('ADA.ADA')

      expect(tx.to.length).toBe(2)
      expect(tx.to[0].to).toBe(
        'addr1q8h6u88370nw2va448ukdj9spujm5an7nce8j0qg6hzg0kw5xxq3r3rcel85zeezwm5w9e3l449j0gudvge3c9tht68s2uw5gk',
      )
      expect(tx.to[0].amount.amount().toString()).toBe('49999788000000')
      expect(tx.to[0].asset ? assetToString(tx.to[0].asset) : undefined).toBe('ADA.ADA')

      expect(tx.to[1].to).toBe(
        'addr1q88p8j5jgpujpf33l5ja2rreearp3x9x59ju65hxkhu29jvctwav0g4zrrmq388yc7h22qehlyt4y556atrty5sfdq5q7plfz5',
      )
      expect(tx.to[1].amount.amount().toString()).toBe('19382650711776')
      expect(tx.to[1].asset ? assetToString(tx.to[1].asset) : undefined).toBe('ADA.ADA')
    })

    it('Should get fees without memo', async () => {
      const fees = await client.getFees({
        sender:
          'addr1q8h6u88370nw2va448ukdj9spujm5an7nce8j0qg6hzg0kw5xxq3r3rcel85zeezwm5w9e3l449j0gudvge3c9tht68s2uw5gk',
        amount: assetToBase(assetAmount(1, 6)),
      })

      expect(fees.average.amount().toString()).toBe('168581')
      expect(fees.fast.amount().toString()).toBe('210726')
      expect(fees.fastest.amount().toString()).toBe('252872')
    })
  })
})
