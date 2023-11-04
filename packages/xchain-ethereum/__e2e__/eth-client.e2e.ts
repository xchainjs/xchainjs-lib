import { Balance, Network, TxType } from '@xchainjs/xchain-client'
import { ApproveParams, EstimateApproveParams, IsApprovedParams } from '@xchainjs/xchain-evm'
import { Asset, assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import Client from '../src/client'
import { AssetETH, ETHChain, defaultEthParams } from '../src/const'

// =====Erc-20 asset=====

const assetETH: Asset = {
  chain: ETHChain,
  symbol: `ETH-0xd66c6b4f0be8ce5b39d52e0fd1344c389929b378`,
  ticker: `ETH`,
  synth: false,
}

const AssetBNB: Asset = {
  chain: ETHChain,
  symbol: `ETH`,
  ticker: `ETH`,
  synth: false,
}

defaultEthParams.network = Network.Testnet
defaultEthParams.phrase = process.env.TESTNET_PHRASE

//const clientMainnet = new BscClient(defaultBscParams)
const clientTestnet = new Client(defaultEthParams)

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
describe('xchain-evm (Eth) Integration Tests', () => {
  it('should fetch eth balances', async () => {
    const address = '0x26000cc95ab0886FE8439E53c73b1219Eba9DBCF'
    console.log(address)
    const balances = await clientTestnet.getBalance(address)
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch eth txs', async () => {
    const address = '0x26000cc95ab0886FE8439E53c73b1219Eba9DBCF'
    const txPage = await clientTestnet.getTransactions({ address })
    console.log(JSON.stringify(txPage, null, 2))
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should fetch single eth transfer tx', async () => {
    const txId = '0x045c9c813652651ea46eb160bbc23d324dee9551a6a3a180af91a53d3194ad7f'
    const tx = await clientTestnet.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('0.5', 18))
    expect(tx.asset.chain).toBe(ETHChain)
    expect(tx.asset.ticker).toBe(AssetETH.ticker)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe('0x7ed746476a7f6520babd24eee1fdbcd0f7fb271f')
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe('0x26000cc95ab0886fe8439e53c73b1219eba9dbcf')
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })
  it('should fetch single eth token transfer tx', async () => {
    const txId = '0x50468a9172b5a782ec5bf169bf2559517f83c191a0730383e2f9d953ad24c15d'
    const assetAddress = '0x22C1317FE43132b22860e8b465548613d6151a9F'
    const tx = await clientTestnet.getTransactionData(txId, assetAddress)
    // console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('2.000000000000000000', 18))
    // expect(tx.asset.chain).toBe(assetETH.chain)
    // expect(tx.asset.ticker).toBe(assetETH.ticker)
    // expect(tx.asset.symbol).toBe(assetETH.symbol)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe('0x572af1afa5afcfc6fdf1eb2913aa4463037860e8')
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe('0x26000cc95ab0886fe8439e53c73b1219eba9dbcf')
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })

  it('should transfer 0.01 eth between wallet 0 and 1, with a memo', async () => {
    const recipient = clientTestnet.getAddress(1)
    const amount = assetToBase(assetAmount('0.001', 18))
    const memo = `=:ETH.ETH:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:100000000000`
    const txHash = await clientTestnet.transfer({ amount, recipient, asset: AssetBNB, memo })
    console.log(txHash)
  })
  it('should transfer 0.001 eth between wallet 0 and 1, with a memo', async () => {
    const recipient = clientTestnet.getAddress(1)
    const amount = assetToBase(assetAmount('0.001', 18))

    const memo = '=:ETH.ETH:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:100000000000'
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
  it('should prepate transaction', async () => {
    try {
      const from = '0x26000cc95ab0886FE8439E53c73b1219Eba9DBCF'
      const to = '0x26000cc95ab0886FE8439E53c73b1219Eba9DBCF'
      const amount = assetToBase(assetAmount('0.0001'))
      const rawUnsignedTransaction = await clientTestnet.prepareTx({
        sender: from,
        recipient: to,
        amount,
        memo: 'test',
      })
      console.log(rawUnsignedTransaction)
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
  it('should prepare ERC20 transaction', async () => {
    const from = '0x66d8d1b4132c07f4861cbc2Ea6323a2acd5Dd893'
    const to = '0x66d8d1b4132c07f4861cbc2Ea6323a2acd5Dd893'
    const erc20Address = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    try {
      const unsignedRawTx = await clientTestnet.prepareTx({
        sender: from,
        recipient: to,
        asset: {
          chain: 'ETH',
          symbol: `ETH-${erc20Address}`,
          ticker: 'ETH',
          synth: false,
        },
        amount: assetToBase(assetAmount(0.1, 6)),
      })
      console.log(unsignedRawTx)
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
  it('should prepare ERC20 Approve', async () => {
    const from = '0x26000cc95ab0886FE8439E53c73b1219Eba9DBCF'
    const to = '0x66d8d1b4132c07f4861cbc2Ea6323a2acd5Dd893'
    const erc20Address = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    try {
      const unsignedRawTx = await clientTestnet.prepareApprove({
        sender: from,
        spenderAddress: to,
        contractAddress: erc20Address,
        amount: assetToBase(assetAmount(0.1, 6)),
      })
      console.log(unsignedRawTx)
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
})
