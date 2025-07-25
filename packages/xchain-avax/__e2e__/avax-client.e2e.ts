import { Balance, Network, TxType } from '@xchainjs/xchain-client'
import { ApproveParams, EstimateApproveParams, IsApprovedParams } from '@xchainjs/xchain-evm'
import { AssetType, TokenAsset, assetAmount, assetToBase, assetToString, baseAmount } from '@xchainjs/xchain-util'

import AvaxClient from '../src'
import { AVAXChain, AssetAVAX, defaultAvaxParams } from '../src/const'

// import { ApproveParams, EstimateApproveParams, IsApprovedParams } from '../src/types'

// =====Erc-20 asset=====

const assetRIP: TokenAsset = {
  chain: AVAXChain,
  symbol: `RIP-0x224695ba2a98e4a096a519b503336e06d9116e48`,
  ticker: `RIP`,
  type: AssetType.TOKEN,
}

defaultAvaxParams.network = Network.Mainnet
defaultAvaxParams.phrase = process.env.MAINNET_PHRASE

const client = new AvaxClient({
  ...defaultAvaxParams,
})

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
describe('xchain-evm (Avax) Integration Tests', () => {
  it('should fetch avax balances', async () => {
    const address = '0x09383137C1eEe3E1A8bc781228E4199f6b4A9bbf'
    console.log(address)
    const balances = await client.getBalance(address)
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should get address', async () => {
    const address = await client.getAddressAsync()
    console.log(address)
  })
  it('should fetch avax txs', async () => {
    const address = '0x55aEd0ce035883626e536254dda2F23a5b5D977f'
    const txPage = await client.getTransactions({ address })
    console.log(JSON.stringify(txPage, null, 2))
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should fetch single avax transfer tx', async () => {
    const txId = '0x4dab51e68d03df97aaf3c8fd9afa3026f6ca7531f79b11a0c0ed39df6d0119e9'
    const tx = await client.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('0.01', 18))
    expect(tx.asset.chain).toBe(AVAXChain)
    expect(tx.asset.ticker).toBe(AssetAVAX.ticker)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe(await client.getAddressAsync(0))
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe(await client.getAddressAsync(1))
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })
  it('should fetch single RIP token transfer tx', async () => {
    const txId = '0x15fa3948bf5c980de8be74afec94b69e6aba1134ed6714aa20fdb6bddb7738f8'
    const tx = await client.getTransactionData(txId, '0x224695Ba2a98E4a096a519B503336E06D9116E48')
    // console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('0.01', 18))
    expect(tx.asset.chain).toBe(assetRIP.chain)
    expect(tx.asset.ticker).toBe(assetRIP.ticker)
    expect(tx.asset.symbol).toBe(assetRIP.symbol)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe(await client.getAddressAsync(0))
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe(await client.getAddressAsync(1))
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })

  it('should transfer 0.01 AVAX between wallet 0 and 1, with a memo', async () => {
    const recipient = await client.getAddressAsync(1)
    console.log('recipient', recipient)
    const amount = assetToBase(assetAmount('0.01', 18))
    const memo = `=:BNB.BUSD-BD1:bnb1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:100000000000`
    const txHash = await client.transfer({ amount, recipient, memo })
    console.log(txHash)
  })
  it('should transfer 0.01 AVAX following EIP1559 because of maxFeePerGas', async () => {
    const recipient = await client.getAddressAsync(1)
    const amount = assetToBase(assetAmount('0.01', 18))
    const txHash = await client.transfer({
      amount,
      recipient,
      maxFeePerGas: baseAmount('51700000000', 18),
    })
    console.log(txHash)
  })
  it('should transfer 0.01 AVAX following EIP1559 because of maxPriorityFeePerGas', async () => {
    const recipient = await client.getAddressAsync(1)
    const amount = assetToBase(assetAmount('0.01', 18))
    const txHash = await client.transfer({
      amount,
      recipient,
      maxPriorityFeePerGas: baseAmount('1700000000', 18),
    })
    console.log(txHash)
  })
  it('should transfer 0.01 RIP(ERC-20) between wallet 0 and 1', async () => {
    const recipient = client.getAddress(1)
    const amount = assetToBase(assetAmount('0.01', 18))
    //ERC20 address The Crypt (RIP)

    const txHash = await client.transfer({ amount, recipient, asset: assetRIP })
    console.log(txHash)
  })
  it('should approve 0.01 RIP(ERC-20) between wallet 0 and 1', async () => {
    const recipient = await client.getAddressAsync(1)
    const amount = assetToBase(assetAmount('0.01', 6))
    //ERC20 address The Crypt (RIP)

    const txHash = await client.approve({
      amount,
      contractAddress: '0x224695ba2a98e4a096a519b503336e06d9116e48',
      spenderAddress: recipient,
    })
    console.log(txHash)
  })
  it('should test erc-20 approvals ', async () => {
    let isApproved = false
    // check if approved for 1 RIP, should be false
    const params: IsApprovedParams = {
      contractAddress: '0x224695Ba2a98E4a096a519B503336E06D9116E48', //ERC20 address The Crypt (RIP)
      spenderAddress: '0x688d21b0b8dc35971af58cff1f7bf65639937860', //PangolinRouter contract on testnet
      amount: assetToBase(assetAmount('1', 18)),
    }
    isApproved = await client.isApproved(params)
    expect(isApproved).toBe(false)

    //  approve for 1 RIP
    const approveParams: ApproveParams = {
      contractAddress: '0x224695Ba2a98E4a096a519B503336E06D9116E48', //ERC20 address The Crypt (RIP)
      spenderAddress: '0x688d21b0b8dc35971af58cff1f7bf65639937860', //PangolinRouter contract on testnet
      amount: assetToBase(assetAmount('1', 18)),
      walletIndex: 0,
    }
    await client.approve(approveParams)
    await delay(10_000) //wait 10 secs for block to be mined

    // check if approved for 1 RIP, should be true
    isApproved = await client.isApproved(params)
    expect(isApproved).toBe(true)

    // set approve below 1 rip
    approveParams.amount = assetToBase(assetAmount('0.1', 18))
    await client.approve(approveParams)
    await delay(10_000) //wait 10 secs for block to be mined

    // check if approved for 1 RIP, should be false
    isApproved = await client.isApproved(params)
    expect(isApproved).toBe(false)
  })
  it('should test estimates ', async () => {
    const estimateParams: EstimateApproveParams = {
      fromAddress: client.getAddress(0),
      contractAddress: '0x224695Ba2a98E4a096a519B503336E06D9116E48', //ERC20 address The Crypt (RIP)
      spenderAddress: '0x688d21b0b8dc35971af58cff1f7bf65639937860', //PangolinRouter contract on testnet
      amount: assetToBase(assetAmount('1', 18)),
    }
    const gasEstimate = await client.estimateApprove(estimateParams)
    console.log(gasEstimate.toString())
    expect(gasEstimate.gte(0)).toBe(true)

    const recipient = await client.getAddressAsync(1)
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
