import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { Client, defaultTRONParams, AssetTRX, TRX_DECIMAL, AssetTRONUSDT, TRON_USDT_CONTRACT } from '../src'

describe('TRON client e2e test', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      ...defaultTRONParams,
      phrase: process.env.PHRASE_MAINNET,
    })
  })

  it('Should get Tron address', async () => {
    const address_0 = client.getAddress(0)
    console.log('address with wallet index 0:', address_0)
    const address_1 = client.getAddress(1)
    console.log('address with wallet index 1:', address_1)
  })

  it('Should get asset info', () => {
    console.log('asset info:', client.getAssetInfo())
  })

  it('Should get explorer url', () => {
    console.log('explorer url:', client.getExplorerUrl())
    console.log('explorer url for address:', client.getExplorerAddressUrl('address'))
    console.log('explorer url for tx:', client.getExplorerTxUrl('tx_hash'))
  })

  it('Should validate address', () => {
    console.log('validate correct address result:', client.validateAddress('TNNbHjEB1yzheEH9z3nx5uTbZsvwDUMw6Y'))
    console.log('invalidate wrong address result:', client.validateAddress('wrong_TNNbHjEB1yzheEH9z3nx5uTbZsvwDUMw6Y'))
  })

  it('Should get balance', async () => {
    const address = client.getAddress()
    const balance = await client.getBalance(address)
    console.log(`Balance: ${balance[0].amount.amount().toString()} ${balance[0].asset.symbol}`)
  })

  it('Should check if account exists', async () => {
    const address = client.getAddress()
    const res = await client.accountExists(address)
    console.log(`Check if account exists: ${res}`)
  })

  it('Should get Account Resources', async () => {
    const address = client.getAddress()
    const res = await client.getAccountResources(address)
    console.log(`Get Account Resources: ${address}`, res)
  })

  it('Should get chain parameters', async () => {
    const res = await client.getChainParameters()
    console.log(`Chain Parameters:`, res)
  })

  it('Should fetch token metadata', async () => {
    const address = client.getAddress()
    const res = await client.fetchTokenMetadata({ contractAddress: TRON_USDT_CONTRACT, address })
    console.log(`USDT Token Metadata:`, res)
  })

  it('Should fetch token balance', async () => {
    const address = client.getAddress()
    const res = await client.fetchTokenBalance({ address, contractAddress: TRON_USDT_CONTRACT })
    console.log(`USDT Token Metadata:`, res)
  })

  it('Should get fees for TRX transfer', async () => {
    const address_1 = client.getAddress(1)

    const feeData = await client.getFees({
      walletIndex: 0,
      asset: AssetTRX,
      recipient: address_1,
      amount: assetToBase(assetAmount('0.1', TRX_DECIMAL)),
    })
    console.log(`Avg Fee for TRX transfer:`, feeData.average.amount().toString())
  })

  it('Should get fees for TRC20 transfer', async () => {
    const address_1 = client.getAddress(1)

    const feeData = await client.getFees({
      walletIndex: 0,
      asset: AssetTRONUSDT,
      recipient: address_1,
      amount: assetToBase(assetAmount('0.1', 6)),
    })
    console.log(`Avg Fee for TRC20 transfer:`, feeData.average.amount().toString())
  })

  it('Should transfer without memo', async () => {
    // NOTE: should send to different address because TRON doesn't support transfer to same address
    const address_1 = client.getAddress(1)
    const hash = await client.transfer({
      walletIndex: 0,
      asset: AssetTRX,
      amount: assetToBase(assetAmount('0.1', TRX_DECIMAL)),
      recipient: address_1,
    })
    console.log('transfer without memo tx hash:', hash)
  })

  it('Should transfer TX with memo', async () => {
    // NOTE: should send to different address because TRON doesn't support transfer to same address
    const address_1 = client.getAddress(1)
    const hash = await client.transfer({
      asset: AssetTRX,
      amount: assetToBase(assetAmount('0.1', TRX_DECIMAL)),
      recipient: address_1,
      memo: 'test',
    })
    console.log('transfer with memo tx hash:', hash)
  })

  it('Should get Approved amount', async () => {
    const address = client.getAddress()
    const SunswapV3Router = 'TQAvWQpT9H916GckwWDJNhYZvQMkuRL7PN'
    const res = await client.getApprovedAmount({
      from: address,
      contractAddress: TRON_USDT_CONTRACT,
      spenderAddress: SunswapV3Router,
    })
    console.log(`Token Approved Amount:`, res)
  })

  it('Should check if approved contract for USDT spend', async () => {
    const SunswapV3Router = 'TQAvWQpT9H916GckwWDJNhYZvQMkuRL7PN'
    const res = await client.isApproved({
      walletIndex: 0,
      contractAddress: TRON_USDT_CONTRACT,
      spenderAddress: SunswapV3Router,
      amount: assetToBase(assetAmount('10', 6)),
    })
    console.log(`If approved contract for USDT:`, res)
  })

  it('Should approve contract', async () => {
    const SunswapV3Router = 'TQAvWQpT9H916GckwWDJNhYZvQMkuRL7PN'
    const txHash = await client.approve({
      walletIndex: 0,
      contractAddress: TRON_USDT_CONTRACT,
      spenderAddress: SunswapV3Router,
      amount: assetToBase(assetAmount('10', 6)),
    })
    console.log(`Approve tx:`, txHash)
  })

  it('Should get transactions', async () => {
    const txHistoryParam = {
      address: client.getAddress(),
      offset: 0,
      limit: 8,
    }
    const txns = await client.getTransactions(txHistoryParam)
    console.log('Transactions', txns)
  })

  it('Should get tx data by tx hash', async () => {
    // const txHistoryParam = {
    //   address: client.getAddress(),
    //   offset: 0,
    //   limit: 1,
    // }
    // const txns = await client.getTransactions(txHistoryParam)
    // const txHash = txns.txs[0].hash

    const trxTransferTxHash = '875ee21bfaf4fdfd6d8ae64cb148c28427a3506017ff2f5a5454eb26b3a384ab'
    const trc20TransferTxHash = '5eccfc3c8cf7865db03165c45b4ea647dae018aeeb6c828cba2ee230b641a560'

    const txData1 = await client.getTransactionData(trxTransferTxHash)
    console.log(`TRX Transfer Transaction Data by TxHash (${trxTransferTxHash})`, txData1)
    const txData2 = await client.getTransactionData(trc20TransferTxHash)
    console.log(`TRC20 Transfer Transaction Data by TxHash (${trc20TransferTxHash})`, txData2)
  })
})
