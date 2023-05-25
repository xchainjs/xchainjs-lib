// import { Network, TxType } from '@xchainjs/xchain-client'
import { Balance } from '@xchainjs/xchain-client'
import { EtherscanProvider as XchainEtherscanProvider } from '@xchainjs/xchain-evm'
import { assetToString } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import { AssetETH, ETHChain } from '../src/const'

// =====Erc-20 asset=====

// =====Ethers providers=====
const ETH_TESTNET_ETHERS_PROVIDER = new ethers.providers.EtherscanProvider('sepolia', process.env['ETHERSCAN_API_KEY'])
const provider = new XchainEtherscanProvider(
  ETH_TESTNET_ETHERS_PROVIDER,
  'https://api-sepolia.etherscan.io/',
  process.env['ETHERSCAN_API'] || '',
  ETHChain,
  AssetETH,
  18,
)

// function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms))
// }
describe('etherscan Integration Tests', () => {
  it('should fetch all balances 1', async () => {
    const balances = await provider.getBalance('0x26000cc95ab0886FE8439E53c73b1219Eba9DBCF')
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })

  it('should fetch alltxs', async () => {
    const txs = await provider.getTransactions({ address: '0x26000cc95ab0886FE8439E53c73b1219Eba9DBCF' })
    txs.txs.forEach((tx) => {
      console.log(JSON.stringify(tx))
    })
    expect(txs.total).toBeGreaterThan(10)
  })
})
