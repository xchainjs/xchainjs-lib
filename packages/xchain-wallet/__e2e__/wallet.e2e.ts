import { AssetBCH, BCH_DECIMAL, Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { Network } from '@xchainjs/xchain-client'
import { AssetETH, Client as EthClient, ETH_GAS_ASSET_DECIMAL, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as MayaClient } from '@xchainjs/xchain-mayachain'
import { AssetRuneNative, Client as ThorClient, RUNE_DECIMAL } from '@xchainjs/xchain-thorchain'
import { assetAmount, assetFromStringEx, assetToBase, assetToString, baseToAsset } from '@xchainjs/xchain-util'

import { Wallet } from '../src/wallet'

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
      BCH: new BchClient({ ...defaultBchParams, network, phrase: seed }),
    })
  })

  it('Should get chain address', async () => {
    const address = await wallet.getAddress('THOR')
    expect(address).toBeDefined()
  })

  it('Should get all addresses', async () => {
    const addresses = await wallet.getAddresses()
    expect(Object.keys(addresses).length).toBe(4)
    expect('THOR' in addresses).toBeTruthy()
    expect('MAYA' in addresses).toBeTruthy()
    expect('ETH' in addresses).toBeTruthy()
    expect('BCH' in addresses).toBeTruthy()
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
    expect(Object.keys(chainsBalances).length).toBe(4)
    Object.keys(chainsBalances).forEach((chain) => {
      const balances = chainsBalances[chain]
      if (balances.status === 'fulfilled') {
        console.log(
          balances.balances.map((balance) => {
            return {
              asset: assetToString(balance.asset),
              amount: baseToAsset(balance.amount).amount().toString(),
            }
          }),
        )
      } else {
        console.log(`Can not retrieve balance of ${chain}`)
      }
    })
  })

  it('Should get interested chain balances', async () => {
    const chainsBalances = await wallet.getBalances({
      MAYA: [assetFromStringEx('MAYA.CACAO')],
      THOR: [assetFromStringEx('THOR.RUNE')],
    })
    expect(Object.keys(chainsBalances).length).toBe(2)
    Object.keys(chainsBalances).forEach((chain) => {
      const balances = chainsBalances[chain]
      if (balances.status === 'fulfilled') {
        console.log(
          balances.balances.map((balance) => {
            return {
              asset: assetToString(balance.asset),
              amount: baseToAsset(balance.amount).amount().toString(),
            }
          }),
        )
      } else {
        console.log(`Can not retrieve balance of ${chain}`)
      }
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

  it('Should estimate Utxo transfer', async () => {
    const txEstimated = await wallet.estimateTransferFees({
      asset: AssetBCH,
      recipient: await wallet.getAddress(AssetBCH.chain),
      amount: assetToBase(assetAmount(1, BCH_DECIMAL)),
      memo: 'test',
    })
    console.log({
      type: txEstimated.type,
      average: baseToAsset(txEstimated.average).amount().toString(),
      fast: baseToAsset(txEstimated.fast).amount().toString(),
      fastest: baseToAsset(txEstimated.fastest).amount().toString(),
    })
  })

  it('Should estimate Evm transfer', async () => {
    const txEstimated = await wallet.estimateTransferFees({
      asset: AssetETH,
      recipient: await wallet.getAddress(AssetETH.chain),
      amount: assetToBase(assetAmount(0.01, ETH_GAS_ASSET_DECIMAL)),
      memo: 'test',
    })
    console.log({
      type: txEstimated.type,
      average: baseToAsset(txEstimated.average).amount().toString(),
      fast: baseToAsset(txEstimated.fast).amount().toString(),
      fastest: baseToAsset(txEstimated.fastest).amount().toString(),
    })
  })

  it('Should estimate Cosmos transfer', async () => {
    const txEstimated = await wallet.estimateTransferFees({
      asset: AssetRuneNative,
      recipient: await wallet.getAddress(AssetRuneNative.chain),
      amount: assetToBase(assetAmount(1, RUNE_DECIMAL)),
      memo: 'test',
    })
    console.log({
      type: txEstimated.type,
      average: baseToAsset(txEstimated.average).amount().toString(),
      fast: baseToAsset(txEstimated.fast).amount().toString(),
      fastest: baseToAsset(txEstimated.fastest).amount().toString(),
    })
  })
})
