import { Balance, Network, TxType } from '@xchainjs/xchain-client'
import { ApproveParams, EstimateApproveParams, IsApprovedParams } from '@xchainjs/xchain-evm'
import { Asset, assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import BscClient from '../src/client'
import { AssetBSC, BSCChain, defaultBscParams } from '../src/const'

// =====Erc-20 asset=====

const assetTST: Asset = {
  chain: BSCChain,
  symbol: `_TST4-0x0886dc84b4263d3a9420b90cb2b185407a4d41e3`,
  ticker: `_TST4`,
  synth: false,
}
defaultBscParams.network = Network.Testnet
defaultBscParams.phrase = process.env.PHRASE
const client = new BscClient(defaultBscParams)

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
describe('xchain-evm (Bsc) Integration Tests', () => {
  it('should fetch bsc balances', async () => {
    const address = client.getAddress(0)
    console.log(address)
    const balances = await client.getBalance(address)
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch bsc txs', async () => {
    const address = '0x0af7e0671c82920c28e951e40c4bd20b5fc3937d'
    const txPage = await client.getTransactions({ address })
    console.log(JSON.stringify(txPage, null, 2))
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should fetch single bsc transfer tx', async () => {
    const txId = '0x2c8311757e90f33ec4be78939464564951b23f11ff11e3e21738013d110df7ed'
    const tx = await client.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('0.5', 18))
    expect(tx.asset.chain).toBe(BSCChain)
    expect(tx.asset.ticker).toBe(AssetBSC.ticker)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe('0xaa25aa7a19f9c426e07dee59b12f944f4d9f1dd3')
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe('0x0af7e0671c82920c28e951e40c4bd20b5fc3937d')
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })
  it('should fetch single TST4 token transfer tx', async () => {
    const txId = '0xd61bb06bc32bb3367bb0be94756ac3c245775d721d9db69e1e9e789710c271bf'
    const tx = await client.getTransactionData(txId, '0x0886dC84B4263d3A9420B90CB2b185407a4D41e3')
    // console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('6000', 18))
    expect(tx.asset.chain).toBe(assetTST.chain)
    expect(tx.asset.ticker).toBe(assetTST.ticker)
    expect(tx.asset.symbol).toBe(assetTST.symbol)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe('0x7a5cc9d2ab8b8abc369ba9adbccf1b2c2f8957b1')
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe('0x0af7e0671c82920c28e951e40c4bd20b5fc3937d')
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })

  it('should transfer 0.01 BSC between wallet 0 and 1, with a memo', async () => {
    const recipient = client.getAddress(1)
    const amount = assetToBase(assetAmount('0.001', 18))
    const memo = `=:BNB.BUSD-BD1:bnb1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:100000000000`
    const txHash = await client.transfer({ amount, recipient, memo })
    console.log(txHash)
  })
  it('should transfer 10 TST4 between wallet 0 and 1, with a memo', async () => {
    const recipient = client.getAddress(1)
    const amount = assetToBase(assetAmount('10', 18))

    const memo = '=:BNB.BUSD-BD1:bnb1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:100000000000'
    const txHash = await client.transfer({ amount, recipient, asset: assetTST, memo })
    console.log(txHash)
  })
  it('should test erc-20 approvals ', async () => {
    let isApproved = false
    // check if approved for 50 TST4, should be false
    const params: IsApprovedParams = {
      contractAddress: '0x0886dc84b4263d3a9420b90cb2b185407a4d41e3', //TST4 address
      spenderAddress: '0xdc4904b5f716Ff30d8495e35dC99c109bb5eCf81', //PancakeRouter contract on testnet
      amount: assetToBase(assetAmount('50', 18)),
    }
    isApproved = await client.isApproved(params)
    expect(isApproved).toBe(false)

    //  approve for 50 TST4
    const approveParams: ApproveParams = {
      contractAddress: '0x0886dc84b4263d3a9420b90cb2b185407a4d41e3', //TST4 address
      spenderAddress: '0xdc4904b5f716Ff30d8495e35dC99c109bb5eCf81', //PancakeRouter contract on testnet
      amount: assetToBase(assetAmount('50', 18)),
      walletIndex: 0,
    }
    await client.approve(approveParams)
    await delay(10_000) //wait 10 secs for block to be mined

    // check if approved for 50 TST4, should be true
    isApproved = await client.isApproved(params)
    expect(isApproved).toBe(true)

    // set approve below 50 TST4
    approveParams.amount = assetToBase(assetAmount('40', 18))
    await client.approve(approveParams)
    await delay(10_000) //wait 10 secs for block to be mined

    // check if approved for 50 TST4, should be false
    isApproved = await client.isApproved(params)
    expect(isApproved).toBe(false)
  })
  it('should test estimates ', async () => {
    const estimateParams: EstimateApproveParams = {
      fromAddress: client.getAddress(0),
      contractAddress: '0x0886dc84b4263d3a9420b90cb2b185407a4d41e3', //TST4 address
      spenderAddress: '0xdc4904b5f716Ff30d8495e35dC99c109bb5eCf81', //PancakeRouter contract on testnet
      amount: assetToBase(assetAmount('80', 18)),
    }
    const gasEstimate = await client.estimateApprove(estimateParams)
    console.log(gasEstimate.toString())
    expect(gasEstimate.gte(0)).toBe(true)

    const recipient = client.getAddress(1)
    const amount = assetToBase(assetAmount('0.01', 18))
    const memo = '=:BNB.BUSD-BD1:bnb1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:100000000000'
    const gasEstimateWithMemo = await client.estimateFeesWithGasPricesAndLimits({ amount, recipient, memo })
    const gasEstimateWithoutMemo = await client.estimateFeesWithGasPricesAndLimits({ amount, recipient })
    expect(gasEstimateWithMemo.gasLimit.gte(gasEstimateWithoutMemo.gasLimit)).toBe(true)
    expect(gasEstimateWithMemo.fees.average.gte(gasEstimateWithoutMemo.fees.average)).toBe(true)

    const gasPrices = await client.estimateGasPrices()
    expect(gasPrices.fast.gte(gasPrices.average)).toBe(true)
    expect(gasPrices.fastest.gte(gasPrices.average)).toBe(true)
    expect(gasPrices.fastest.gte(gasPrices.fast)).toBe(true)
  })
})
