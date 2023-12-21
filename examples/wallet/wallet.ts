import cosmosclient from '@cosmos-client/core'
import { Network } from '@xchainjs/xchain-client'
import { Wallet } from '@xchainjs/xchain-mayachain-amm'
import {
  Asset,
  Chain,
  assetFromStringEx,
  assetToString,
  baseToAsset,
  delay,
  register9Rheader,
} from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(cosmosclient.config.globalAxios)
register9Rheader(axios)

const _getBalances = async (wallet: Wallet, assets?: Asset[]) => {
  const chainsBalances = await wallet.getBalances(assets)
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
}

const _getBalance = async (wallet: Wallet, chain: Chain, assets?: Asset[]) => {
  const balances = await wallet.getBalance(chain, assets)
  console.log(
    balances.map((balance) => {
      return {
        asset: assetToString(balance.asset),
        amount: baseToAsset(balance.amount).amount().toString(),
      }
    }),
  )
}

const _getAddresses = async (wallet: Wallet, chains?: Chain[]) => {
  const chainAddresses = await wallet.getAddresses(chains)
  console.log(chainAddresses)
}

const _getAddress = async (wallet: Wallet, chain: Chain) => {
  const address = await wallet.getAddress(chain)
  console.log(address)
}

const _getHistories = async (wallet: Wallet, chains?: Chain[]) => {
  const histories = await wallet.getTransactionsHistories(chains)
  Object.keys((chain) => {
    const history = histories[chain]
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
}

const _getHistory = async (wallet: Wallet, chain: Chain) => {
  const history = await wallet.getTransactionsHistory(chain)
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
}

const _getTransactionData = async (wallet: Wallet, chain: Chain, hash: string) => {
  const tx = await wallet.getTransactionData(chain, hash)
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
}

const main = async () => {
  const seed = process.argv[2]
  const wallet: Wallet = new Wallet(seed, Network.Mainnet)

  console.log('============= Get all wallet balances ==============')
  await _getBalances(wallet)
  await delay(5000)

  console.log('============= Get assets balances interested in ==============')
  await _getBalances(wallet, [assetFromStringEx('MAYA.CACAO'), assetFromStringEx('THOR.RUNE')])
  await delay(5000)

  console.log('============= Get all balances from one single chain ==============')
  await _getBalance(wallet, 'ETH')
  await delay(5000)

  console.log('============= Get asset balance from chain ==============')
  await _getBalance(wallet, 'ETH', [assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7')])
  await delay(5000)

  console.log('============= Get all wallet addresses ==============')
  await _getAddresses(wallet)
  await delay(5000)

  console.log('============= Get chain wallet address ==============')
  await _getAddress(wallet, 'MAYA')
  await delay(5000)

  // Commented due to Ninerealms limitations
  // console.log('============= Get Wallet history ==============')
  // await getHistories(wallet)

  console.log('============= Get histories interested in ==============')
  await _getHistories(wallet, ['BTC', 'ETH'])
  await delay(5000)

  console.log('============= Get chain history ==============')
  await _getHistory(wallet, 'ETH')
  await delay(5000)

  console.log('============= Get transaction data ==============')
  await _getTransactionData(wallet, 'BTC', 'f91312f16f1d1dd8a68f00d7aa48575079837bfe119eed705d2b284d7624bfba')
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
