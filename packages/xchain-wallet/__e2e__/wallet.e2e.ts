import { Network } from '@xchainjs/xchain-client'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as MayaClient } from '@xchainjs/xchain-mayachain'
import { Client as ThorClient } from '@xchainjs/xchain-thorchain'
import { assetFromStringEx, assetToString, baseToAsset } from '@xchainjs/xchain-util'

import { Wallet } from '..'

describe('Wallet', () => {
  let wallet: Wallet

  beforeAll(() => {
    const seed = ''
    const network = Network.Mainnet

    wallet = new Wallet({
      THOR: new ThorClient({ network, phrase: seed }),
      MAYA: new MayaClient({ network, phrase: seed }),
      ETH: new EthClient({
        ...defaultEthParams,
        network,
        phrase: seed,
      }),
    })
  })

  it('Should get chain address', async () => {
    const address = await wallet.getAddress('THOR')
    expect(address).toBeDefined()
  })

  it('Should get all addresses', async () => {
    const addresses = await wallet.getAddresses()
    expect(Object.keys(addresses).length).toBe(3)
    expect('THOR' in addresses).toBeTruthy()
    expect('MAYA' in addresses).toBeTruthy()
    expect('ETH' in addresses).toBeTruthy()
  })

  it('Should get interested chain addresses', async () => {
    const addresses = await wallet.getAddresses(['MAYA', 'THOR'])
    expect(Object.keys(addresses).length).toBe(2)
    expect('THOR' in addresses).toBeTruthy()
    expect('MAYA' in addresses).toBeTruthy()
  })

  it('Should not get chain address of unknown client', async () => {
    await expect(async () => {
      await wallet.getAddress('BTC')
    }).rejects.toThrowError(`Client not found for BTC chain`)
  })

  it('Should get chain balance', async () => {
    const balances = await wallet.getBalance('ETH')
    console.log(
      balances.map((balance) => {
        return {
          asset: assetToString(balance.asset),
          amount: baseToAsset(balance.amount).amount().toString(),
        }
      }),
    )
  })

  it('Should get all balances', async () => {
    const chainsBalances = await wallet.getBalances()
    expect(Object.keys(chainsBalances).length).toBe(3)
    Object.keys(chainsBalances).forEach((chain) => {
      const balances = chainsBalances[chain]
      console.log(
        balances.map((balance) => {
          return {
            asset: assetToString(balance.asset),
            amount: baseToAsset(balance.amount).amount().toString(),
          }
        }),
      )
    })
  })

  it('Should get interested chain balances', async () => {
    const chainsBalances = await wallet.getBalances([assetFromStringEx('MAYA.CACAO'), assetFromStringEx('THOR.RUNE')])
    expect(Object.keys(chainsBalances).length).toBe(2)
    Object.keys(chainsBalances).forEach((chain) => {
      const balances = chainsBalances[chain]
      console.log(
        balances.map((balance) => {
          return {
            asset: assetToString(balance.asset),
            amount: baseToAsset(balance.amount).amount().toString(),
          }
        }),
      )
    })
  })

  it('Should not get chain balance of unknown client', async () => {
    expect(async () => {
      await wallet.getBalance('BTC')
    }).rejects.toThrowError('Client not found for BTC chain')
  })

  it('Should get transaction data', async () => {
    const tx = await wallet.getTransactionData(
      'THOR',
      'A4A8EB504016E930C10C8E5A5AC2980F89FBE10CF2861D99524574B32E009EA3',
    )
    console.log({
      hash: tx.hash,
      type: tx.type,
      asset: assetToString(tx.asset),
      date: tx.date,
      from: tx.from.map((input) => {
        return {
          address: input.from,
          amount: baseToAsset(input.amount).amount().toString(),
          asset: input.asset ? assetToString(input.asset) : undefined,
        }
      }),
      to: tx.to.map((output) => {
        return {
          address: output.to,
          amount: baseToAsset(output.amount).amount().toString(),
          asset: output.asset ? assetToString(output.asset) : undefined,
        }
      }),
    })
  })

  it('Should not get transaction data of unknown client', async () => {
    expect(async () => {
      await wallet.getTransactionData('BTC', '0eb1fd7d2ab247b2c3f6d79e9b48a71496a117c9bbaa5732636a2d46e72586e7')
    }).rejects.toThrowError('Client not found for BTC chain')
  })

  it('Should get chain history', async () => {
    const history = await wallet.getTransactionsHistory('ETH')
    console.log({
      numTxs: history.total,
      txs: history.txs.map((tx) => {
        return {
          hash: tx.hash,
          type: tx.type,
          asset: assetToString(tx.asset),
          date: tx.date,
          from: tx.from.map((input) => {
            return {
              address: input.from,
              amount: baseToAsset(input.amount).amount().toString(),
              asset: input.asset ? assetToString(input.asset) : undefined,
            }
          }),
          to: tx.to.map((output) => {
            return {
              address: output.to,
              amount: baseToAsset(output.amount).amount().toString(),
              asset: output.asset ? assetToString(output.asset) : undefined,
            }
          }),
        }
      }),
    })
  })

  it('Should get all chain histories', async () => {
    const chainsHistories = await wallet.getTransactionsHistories()
    expect(Object.keys(chainsHistories).length).toBe(3)
    Object.keys(chainsHistories).forEach((chain) => {
      const history = chainsHistories[chain]
      console.log({
        numTxs: history.total,
        txs: history.txs.map((tx) => {
          return {
            hash: tx.hash,
            type: tx.type,
            asset: assetToString(tx.asset),
            date: tx.date,
            from: tx.from.map((input) => {
              return {
                address: input.from,
                amount: baseToAsset(input.amount).amount().toString(),
                asset: input.asset ? assetToString(input.asset) : undefined,
              }
            }),
            to: tx.to.map((output) => {
              return {
                address: output.to,
                amount: baseToAsset(output.amount).amount().toString(),
                asset: output.asset ? assetToString(output.asset) : undefined,
              }
            }),
          }
        }),
      })
    })
  })

  it('Should get interested chain histories', async () => {
    const chainsHistories = await wallet.getTransactionsHistories(['MAYA'])
    expect(Object.keys(chainsHistories).length).toBe(1)
    Object.keys(chainsHistories).forEach((chain) => {
      const history = chainsHistories[chain]
      console.log({
        numTxs: history.total,
        txs: history.txs.map((tx) => {
          return {
            hash: tx.hash,
            type: tx.type,
            asset: assetToString(tx.asset),
            date: tx.date,
            from: tx.from.map((input) => {
              return {
                address: input.from,
                amount: baseToAsset(input.amount).amount().toString(),
                asset: input.asset ? assetToString(input.asset) : undefined,
              }
            }),
            to: tx.to.map((output) => {
              return {
                address: output.to,
                amount: baseToAsset(output.amount).amount().toString(),
                asset: output.asset ? assetToString(output.asset) : undefined,
              }
            }),
          }
        }),
      })
    })
  })

  it('Should not get chain history of unknown client', async () => {
    expect(async () => {
      await wallet.getBalance('BTC')
    }).rejects.toThrowError('Client not found for BTC chain')
  })
})
