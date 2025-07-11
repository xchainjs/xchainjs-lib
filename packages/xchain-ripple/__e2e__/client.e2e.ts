import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { Client, defaultXRPParams, AssetXRP, XRP_DECIMAL } from '../src'

describe('XRP client e2e test', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      ...defaultXRPParams,
      phrase: process.env.PHRASE_MAINNET,
    })
  })

  it('Should get ripple address', async () => {
    const address_0 = await client.getAddressAsync(0)
    console.log('address with wallet index 0:', address_0)
    const address_1 = await client.getAddressAsync(1)
    console.log('address with wallet index 1:', address_1)
  })

  it('Should get asset info', () => {
    console.log('asset info:', client.getAssetInfo())
  })

  it('Should get explorer url', () => {
    console.log('explorer url:', client.getExplorerUrl())
    console.log('explorer url for address:', client.getExplorerAddressUrl('xrpaddress'))
    console.log('explorer url for tx:', client.getExplorerTxUrl('tx_hash'))
  })

  it('Should validate address', () => {
    console.log('validate correct address result:', client.validateAddress('rBkFurVJfXGByEfvbDHW59BR7PU2ArtMdn'))
    console.log('validate wrong address result:', client.validateAddress('wrong_rBkFurVJfXGByEfvbDHW59BR7PU2ArtMdn'))
  })

  it('Should get balance', async () => {
    const address = await client.getAddressAsync()
    const balance = await client.getBalance(address)
    console.log(`Balance: ${balance[0].amount.amount().toString()} ${balance[0].asset.symbol}`)
  })

  it('Should get fees', async () => {
    const feeData = await client.getFees()
    console.log(`Avg Fee:`, feeData.average.amount().toString())
    console.log(`Fast Fee:`, feeData.fast.amount().toString())
    console.log(`Fastest Fee:`, feeData.fastest.amount().toString())
  })

  it('Should transfer TX without memo', async () => {
    // NOTE: should send to another address because XRPL doesn't support transfer to same address
    const address_1 = await client.getAddressAsync(1)
    const hash = await client.transfer({
      walletIndex: 0,
      asset: AssetXRP,
      amount: assetToBase(assetAmount('1', XRP_DECIMAL)),
      recipient: address_1,
    })
    console.log('transfer without memo tx hash:', hash)
  })

  it('Should transfer TX with memo', async () => {
    // NOTE: should send to another address because XRPL doesn't support transfer to same address
    const address_1 = await client.getAddressAsync(1)
    const hash = await client.transfer({
      asset: AssetXRP,
      amount: assetToBase(assetAmount('1', XRP_DECIMAL)),
      recipient: address_1,
      memo: 'test',
    })
    console.log('transfer with memo tx hash:', hash)
  })

  it('Should get signed transaction and broadcast', async () => {
    // NOTE: should send to another address because XRPL doesn't support transfer to same address
    const address_1 = await client.getAddressAsync(1)
    const txParams = {
      asset: AssetXRP,
      amount: assetToBase(assetAmount('1', XRP_DECIMAL)),
      recipient: address_1,
      memo: 'test',
      walletIndex: 0,
    }

    const xrplClient = await client.getXrplClient()
    const sender = await client.getAddressAsync(0)
    const baseTx = await client.prepareTxForXrpl({ ...txParams, sender })
    const prepared = await xrplClient.autofill(baseTx)

    // get signed tx
    const signed = await client.signTransaction(prepared, txParams.walletIndex || 0)
    console.log('signed tx:', signed.tx_blob)

    // broadcast
    const hash = await client.broadcastTx(signed.tx_blob)
    console.log('tx hash:', hash)
  })

  it('Should get transactions', async () => {
    const txHistoryParam = {
      address: client.getAddress(),
      offset: 0,
      limit: 3,
    }
    const txns = await client.getTransactions(txHistoryParam)
    console.log('Transactions', txns)
  })

  it('Should get tx data by tx hash', async () => {
    const txHistoryParam = {
      address: client.getAddress(),
      offset: 0,
      limit: 1,
    }
    const txns = await client.getTransactions(txHistoryParam)
    const txHash = txns.txs[0].hash
    const txData = await client.getTransactionData(txHash)
    console.log(`Transaction Data by TxHash (${txHash})`, txData)
  })
})
