import { Balance, Network, TxType } from '@xchainjs/xchain-client'
import { ApproveParams, EstimateApproveParams, IsApprovedParams } from '@xchainjs/xchain-evm'
import { Asset, assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import BscClient from '../src/client'
import { AssetBSC, BSCChain, defaultBscParams } from '../src/const'

// =====Erc-20 asset=====

const assetETH: Asset = {
  chain: BSCChain,
  symbol: `ETH-0xd66c6b4f0be8ce5b39d52e0fd1344c389929b378`,
  ticker: `ETH`,
  synth: false,
}

const AssetBNB: Asset = {
  chain: BSCChain,
  symbol: `BNB`,
  ticker: `BNB`,
  synth: false,
}

defaultBscParams.network = Network.Testnet
// defaultBscParams.network = Network.Mainnet
defaultBscParams.phrase = process.env.PHRASE

//const clientMainnet = new BscClient(defaultBscParams)
const clientTestnet = new BscClient(defaultBscParams)

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
describe('xchain-evm (Bsc) Integration Tests', () => {
  it('should fetch bsc balances', async () => {
    const address = clientTestnet.getAddress(0)
    console.log(address)
    const balances = await clientTestnet.getBalance(address)
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch bsc txs', async () => {
    const address = '0xf32DA51880374201852057009c4c4d1e75949e09'
    const txPage = await clientTestnet.getTransactions({ address })
    console.log(JSON.stringify(txPage, null, 2))
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should fetch single bsc transfer tx', async () => {
    const txId = '0x0d67aea90aafc15cbb9f8ec31842f5fc4044e8dced4947079a83e8ab5c068df3'
    const tx = await clientTestnet.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('0.5', 18))
    expect(tx.asset.chain).toBe(BSCChain)
    expect(tx.asset.ticker).toBe(AssetBSC.ticker)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe('0xaa25aa7a19f9c426e07dee59b12f944f4d9f1dd3')
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe('0xf32da51880374201852057009c4c4d1e75949e09')
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })
  it('should fetch single  bsc.eth token transfer tx', async () => {
    const txId = '0x11a9471062f2b352699895ff5dca2ed805b65eeed2ab173c65e5f424eb2af29a'
    const assetAddress = '0xd66c6b4f0be8ce5b39d52e0fd1344c389929b378'
    const tx = await clientTestnet.getTransactionData(txId, assetAddress)
    // console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('0.001', 18))
    expect(tx.asset.chain).toBe(assetETH.chain)
    expect(tx.asset.ticker).toBe(assetETH.ticker)
    expect(tx.asset.symbol).toBe(assetETH.symbol)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe('0xf32da51880374201852057009c4c4d1e75949e09')
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe('0x089790801ed0dc459a1484a62561026a15adb235')
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })

  it('should transfer 0.01 Bnb between wallet 0 and 1, with a memo', async () => {
    const recipient = clientTestnet.getAddress(1)
    const amount = assetToBase(assetAmount('0.001', 18))
    const memo = `=:BNB.BNB:bnb1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:100000000000`
    const txHash = await clientTestnet.transfer({ amount, recipient, asset: AssetBNB, memo })
    console.log(txHash)
  })
  it('should transfer 0.001 eth between wallet 0 and 1, with a memo', async () => {
    const recipient = clientTestnet.getAddress(1)
    const amount = assetToBase(assetAmount('0.001', 18))

    const memo = '=:BNB.BNB:bnb1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:100000000000'
    const txHash = await clientTestnet.transfer({ amount, recipient, asset: assetETH, memo })
    console.log(txHash)
  })
  it('should test erc-20 approvals ', async () => {
    let isApproved = false
    // check if approved for 0.01 eth, should be false
    const params: IsApprovedParams = {
      contractAddress: '0xd66c6b4f0be8ce5b39d52e0fd1344c389929b378', //ETH contract address
      spenderAddress: '0xdc4904b5f716Ff30d8495e35dC99c109bb5eCf81', //PancakeRouter contract on testnet
      amount: assetToBase(assetAmount('0.01', 18)),
    }
    isApproved = await clientTestnet.isApproved(params)
    expect(isApproved).toBe(false)

    //  approve for 0.01 eth
    const approveParams: ApproveParams = {
      contractAddress: '0xd66c6b4f0be8ce5b39d52e0fd1344c389929b378', //ETH contract address
      spenderAddress: '0xdc4904b5f716Ff30d8495e35dC99c109bb5eCf81', //PancakeRouter contract on testnet
      amount: assetToBase(assetAmount('0.01', 18)),
      walletIndex: 0,
    }
    await clientTestnet.approve(approveParams)
    await delay(10000) //wait 10 secs for block to be mined

    // check if approved for eth, should be true
    isApproved = await clientTestnet.isApproved(params)
    expect(isApproved).toBe(true)

    // set approve below 0.01 eth
    approveParams.amount = assetToBase(assetAmount('0.001', 18))
    await clientTestnet.approve(approveParams)
    await delay(10000) //wait 10 secs for block to be mined

    // check if approved for 0.01 eth, should be false
    isApproved = await clientTestnet.isApproved(params)
    expect(isApproved).toBe(false)
  })
  it('should test estimates ', async () => {
    const estimateParams: EstimateApproveParams = {
      fromAddress: clientTestnet.getAddress(0),
      contractAddress: '0xd66c6b4f0be8ce5b39d52e0fd1344c389929b378', //ETh address
      spenderAddress: '0xdc4904b5f716Ff30d8495e35dC99c109bb5eCf81', //PancakeRouter contract on testnet
      amount: assetToBase(assetAmount('80', 18)),
    }
    const gasEstimate = await clientTestnet.estimateApprove(estimateParams)
    console.log(gasEstimate.toString())
    expect(gasEstimate.gte(0)).toBe(true)

    const recipient = clientTestnet.getAddress(1)
    const amount = assetToBase(assetAmount('0.01', 18))
    const memo = '=:BNB.BUSD-BD1:bnb1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:100000000000'
    const gasEstimateWithMemo = await clientTestnet.estimateFeesWithGasPricesAndLimits({ amount, recipient, memo })
    const gasEstimateWithoutMemo = await clientTestnet.estimateFeesWithGasPricesAndLimits({ amount, recipient })
    expect(gasEstimateWithMemo.gasLimit.gte(gasEstimateWithoutMemo.gasLimit)).toBe(true)
    expect(gasEstimateWithMemo.fees.average.gte(gasEstimateWithoutMemo.fees.average)).toBe(true)

    const gasPrices = await clientTestnet.estimateGasPrices()
    expect(gasPrices.fast.gte(gasPrices.average)).toBe(true)
    expect(gasPrices.fastest.gte(gasPrices.average)).toBe(true)
    expect(gasPrices.fastest.gte(gasPrices.fast)).toBe(true)
  })
})
