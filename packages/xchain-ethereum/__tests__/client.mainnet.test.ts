import nock from 'nock'
import { baseAmount, AssetETH } from '@xchainjs/xchain-util'
import Client from '../src/client'
import { ETH_DECIMAL } from '../src/utils'
import { mock_ethplorer_api_getAddress, mock_ethplorer_api_getTxInfo } from '../__mocks__/ethplorer-api'

const phrase = 'canyon throw labor waste awful century ugly they found post source draft'
// https://iancoleman.io/bip39/
// m/44'/60'/0'/0/0
const addrPath0 = '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E'
// m/44'/60'/0'/0/1
const addrPath1 = '0x1804137641b5CB781226b361976F15B4067ee0F9'
const ethplorerUrl = 'https://api.ethplorer.io'

/**
 * Wallet Tests
 */
describe('Client Test', () => {
  beforeEach(() => {
    nock.disableNetConnect()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('derive path correctly with bip44', () => {
    const ethClient = new Client({
      network: 'mainnet',
      phrase,
      ethplorerUrl,
    })

    expect(ethClient.getAddress(0)).toEqual(addrPath0.toLowerCase())
    expect(ethClient.getAddress(1)).toEqual(addrPath1.toLowerCase())
  })

  it('gets a balance without address args', async () => {
    const ethClient = new Client({
      network: 'mainnet',
      phrase,
      ethplorerUrl,
    })

    mock_ethplorer_api_getAddress(ethplorerUrl, ethClient.getAddress(), {
      address: ethClient.getAddress(),
      ETH: {
        balance: 100,
        price: {
          rate: 1196.5425814145788,
          diff: 11.71,
          diff7d: 62.3,
          ts: 1609987982,
          marketCapUsd: 136582198332.62915,
          availableSupply: 114147377.999,
          volume24h: 44933107598.39366,
          diff30d: 108.688017487141,
          volDiff1: 7.230942506781318,
          volDiff7: 81.97257329720685,
          volDiff30: 16.64321146720964,
        },
      },
      tokens: [],
      countTxs: 1,
    })

    const balances = await ethClient.getBalance()
    expect(balances.length).toEqual(1)
    expect(balances[0].asset).toEqual(AssetETH)
    expect(
      balances[0].amount.amount().isEqualTo(baseAmount('100000000000000000000', ETH_DECIMAL).amount()),
    ).toBeTruthy()
  })

  // it('gets a balance from address', async () => {
  //   const ethClient = new Client({
  //     network: 'mainnet',
  //     phrase,
  //     ethplorerUrl,
  //   })

  //   mock_ethplorer_api_getAddress(ethplorerUrl, '0x12d4444f96c644385d8ab355f6ddf801315b6254', {
  //     address: '0x12d4444f96c644385d8ab355f6ddf801315b6254',
  //     ETH: {
  //       balance: 100,
  //       price: {
  //         rate: 1196.5425814145788,
  //         diff: 11.71,
  //         diff7d: 62.3,
  //         ts: 1609987982,
  //         marketCapUsd: 136582198332.62915,
  //         availableSupply: 114147377.999,
  //         volume24h: 44933107598.39366,
  //         diff30d: 108.688017487141,
  //         volDiff1: 7.230942506781318,
  //         volDiff7: 81.97257329720685,
  //         volDiff30: 16.64321146720964,
  //       },
  //     },
  //     tokens: [
  //       {
  //         balance: 1000,
  //         tokenInfo: {
  //           address: '0x2306934ca884caa042dc595371003093092b2bbf',
  //           decimals: '18',
  //           name: 'tomatos.finance',
  //           owner: '0x',
  //           symbol: 'TOMATOS',
  //           totalSupply: '1000000000000000000000000000',
  //           lastUpdated: 1609117980,
  //           issuancesCount: 0,
  //           holdersCount: 3181,
  //           ethTransfersCount: 0,
  //           price: false,
  //         },
  //       },
  //     ],
  //     countTxs: 1,
  //   })

  //   const balance = await ethClient.getBalance(0)
  //   expect(balance.length).toEqual(2)
  //   expect(assetToString(balance[0].asset)).toEqual(assetToString(AssetETH))
  //   expect(balance[0].amount.amount().isEqualTo(baseAmount('100000000000000000000', ETH_DECIMAL).amount())).toBeTruthy()
  //   expect(balance[1].asset.symbol).toEqual('TOMATOS-0x2306934CA884CAA042DC595371003093092b2BBf')
  //   expect(balance[1].amount.amount().isEqualTo(baseAmount(1000, 18).amount())).toBeTruthy()
  // })

  it('get transaction data', async () => {
    const ethClient = new Client({
      network: 'mainnet',
      phrase,
      ethplorerUrl,
    })

    mock_ethplorer_api_getTxInfo(ethplorerUrl, '0xc058a6e70f043f0887ba0d43198fb31f1752632ef06f7e975e193160fd14897c', {
      hash: '0xc058a6e70f043f0887ba0d43198fb31f1752632ef06f7e975e193160fd14897c',
      timestamp: 1604254250,
      blockNumber: 11172738,
      confirmations: 433964,
      success: true,
      from: '0xbabeae03735f9ed247f73978fe912028c9b5e828',
      to: '0x7ee158dab5b5b7f0bb0c8e5192c563666e7cdd85',
      value: 0,
      input:
        '0xa9059cbb000000000000000000000000e40ec68d7dccb6a7314d0faf6d33a4d72483cd770000000000000000000000000000000000000000000000000000048c27395000',
      gasLimit: 80952,
      gasUsed: 53968,
      logs: [],
      operations: [
        {
          timestamp: 1604254250,
          transactionHash: '0xc058a6e70f043f0887ba0d43198fb31f1752632ef06f7e975e193160fd14897c',
          value: '1000',
          intValue: 1000,
          type: 'transfer',
          isEth: false,
          priority: 203,
          from: '0xbabeae03735f9ed247f73978fe912028c9b5e828',
          to: '0xe40ec68d7dccb6a7314d0faf6d33a4d72483cd77',
          addresses: ['0xbabeae03735f9ed247f73978fe912028c9b5e828', '0xe40ec68d7dccb6a7314d0faf6d33a4d72483cd77'],
          tokenInfo: {
            address: '0x7ee158dab5b5b7f0bb0c8e5192c563666e7cdd85',
            decimals: '6',
            name: 'MEMEI',
            symbol: 'MEI',
            totalSupply: '74075000000000',
            lastUpdated: 1609732766,
            owner: '0x',
            issuancesCount: 0,
            holdersCount: 1557,
            ethTransfersCount: 0,
            price: false,
          },
        },
      ],
    })

    const txData = await ethClient.getTransactionData(
      '0xc058a6e70f043f0887ba0d43198fb31f1752632ef06f7e975e193160fd14897c',
    )

    expect(txData.hash).toEqual('0xc058a6e70f043f0887ba0d43198fb31f1752632ef06f7e975e193160fd14897c')
    expect(txData.asset.symbol).toEqual('MEI-0x7ee158dab5b5b7f0bb0c8e5192c563666e7cdd85')
    expect(txData.from[0].from).toEqual('0xbabeae03735f9ed247f73978fe912028c9b5e828')
    expect(txData.from[0].amount.amount().isEqualTo(baseAmount(1000, 6).amount())).toBeTruthy()
    expect(txData.to[0].to).toEqual('0xe40ec68d7dccb6a7314d0faf6d33a4d72483cd77')
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(1000, 6).amount())).toBeTruthy()
    expect(txData.type).toEqual('transfer')
  })
})
