import { AssetInfo, Network, TxParams } from '@xchainjs/xchain-client'
import { Asset, assetFromString, assetToString, baseAmount, eqAsset } from '@xchainjs/xchain-util'

const AssetKUJI = assetFromString('KUJI.KUJI') as Asset
const AssetTokenKuji = {
  chain: 'KUJI',
  symbol: 'factory/kujira1ltvwg69sw3c5z99c6rr08hal7v0kdzfxz07yj5/demo',
  ticker: '',
  synth: false,
}

import Client from '../src/client'

let xchainClient: Client

class CustomSdkClient extends Client {
  getAssetInfo(): AssetInfo {
    throw new Error('Method not implemented.')
  }
  getDenom(asset: Asset): string | null {
    if (eqAsset(asset, AssetKUJI)) return 'ukuji'
    return null
  }
  assetFromDenom(denom: string): Asset | null {
    if (denom === this.baseDenom) return AssetKUJI
    return {
      chain: AssetKUJI.chain,
      symbol: denom,
      ticker: '',
      synth: false,
    }
  }
  getExplorerUrl(): string {
    throw new Error('Method not implemented.')
  }
  getExplorerAddressUrl(_address: string): string {
    throw new Error('Method not implemented.')
  }
  getExplorerTxUrl(_txID: string): string {
    throw new Error('Method not implemented.')
  }
}

describe('Cosmos SDK client Integration Tests', () => {
  beforeEach(() => {
    const settings = {
      network: Network.Testnet,
      phrase: process.env.TESTNET_PHRASE,
      chain: AssetKUJI.chain,
      defaultDecimals: 6,
      prefix: 'kujira',
      baseDenom: 'ukuji',
      defaultFee: baseAmount(5000, 6),
      rootDerivationPaths: {
        [Network.Mainnet]: `44'/118'/0'/0/`,
        [Network.Testnet]: `44'/118'/0'/0/`,
        [Network.Stagenet]: `44'/118'/0'/0/`,
      },
      clientUrls: {
        [Network.Testnet]: 'https://test-rpc-kujira.mintthemoon.xyz/',
        [Network.Stagenet]: 'wip',
        [Network.Mainnet]: 'wip',
      },
    }
    xchainClient = new CustomSdkClient(settings)
  })
  it('should fetch balances cosmos sdk', async () => {
    const address = await xchainClient.getAddressAsync()
    const balances = await xchainClient.getBalance(address)

    balances.forEach((bal) => {
      console.log(`${address} ${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should validate invalid addreses', async () => {
    const isValid = xchainClient.validateAddress('asdadasd')
    expect(isValid).toBe(false)
  })
  it('should validate valid addreses', async () => {
    const isValid = xchainClient.validateAddress('kujira1es76p8qspctcxhex79c32nng9fvhuxjn4z6u7k')
    expect(isValid).toBe(true)
  })
  it('should generate addreses', async () => {
    const address0 = await xchainClient.getAddressAsync(0)
    console.log('address0', address0)
  })
  it('should get transactions', async () => {
    const txs = await xchainClient.getTransactions({
      address: 'kujira1kltgthzruhvdm8u2rjtke69tppwys63rx3fk8a',
    })
    console.log('txs', txs)
    console.log('To:', txs.txs[0].to[0].amount.amount().toString())
    console.log('From:', txs.txs[0].from[0].amount.amount().toString())
  })
  it('should get transaction data', async () => {
    const tx = await xchainClient.getTransactionData('F3131AE603FFDE602217330410DD3ADFB9E21C987DDAA5CCF54F99DB15A6714B')
    console.log('tx', tx)
    tx.from.forEach((row) => console.log('from:', row.from, row.amount.amount().toString()))
    tx.to.forEach((row) => console.log('to:', row.to, row.amount.amount().toString()))
  })
  it('get fees', async () => {
    const fees = await xchainClient.getFees()
    console.log('fees', fees.average.amount().toString())
  })

  it('transfer', async () => {
    const txDate: TxParams = {
      asset: AssetKUJI,
      amount: baseAmount('1000', 6),
      recipient: 'kujira1es76p8qspctcxhex79c32nng9fvhuxjn4z6u7k',
      memo: 'Rosa melano',
    }
    const txHash = await xchainClient.transfer(txDate)
    console.log('txHash', txHash)
  })

  it('Try secondary token transfer', async () => {
    const txDate: TxParams = {
      asset: AssetTokenKuji,
      amount: baseAmount('100000', 6),
      recipient: 'kujira1es76p8qspctcxhex79c32nng9fvhuxjn4z6u7k',
      memo: 'Rosa melano',
    }
    const txHash = await xchainClient.transfer(txDate)
    console.log('txHash', txHash)
  })
})
