// import { Network, TxType } from '@xchainjs/xchain-client'
import { Balance } from '@xchainjs/xchain-client'
import { EtherscanProvider } from '@xchainjs/xchain-evm'
import { assetToString } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import { AssetBSC, BSCChain } from '../src/const'

// =====Erc-20 asset=====

// =====Ethers providers=====
const BSC_TESTNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://bsc-testnet.public.blastapi.io')
const provider = new EtherscanProvider(
  BSC_TESTNET_ETHERS_PROVIDER,
  'https://api-testnet.bscscan.com',
  process.env['BSCCHAIN_API_KEY'] || '',
  BSCChain,
  AssetBSC,
  18,
)

// function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms))
// }
describe('etherscan Integration Tests', () => {
  it('should fetch all balances 1', async () => {
    const balances = await provider.getBalance('0x0af7e0671c82920c28e951e40c4bd20b5fc3937d')
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch all balances 2', async () => {
    const balances = await provider.getBalance('0xE80aCFfd88fe03129812da0Ef1ce60872D373768')
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(3)
  })
  it('should fetch alltxs', async () => {
    const txs = await provider.getTransactions({ address: '0x35552c16704d214347f29Fa77f77DA6d75d7C752' })
    txs.txs.forEach((tx) => {
      console.log(JSON.stringify(tx))
    })
    expect(txs.total).toBeGreaterThan(10)
  })
})
