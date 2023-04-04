import { AssetBTC, BTCChain } from '../../xchain-bitcoin/src/const'
import { HaskoinNetwork, HaskoinProvider } from '../src/providers'

const haskoinProvider = new HaskoinProvider('https://api.haskoin.com', BTCChain, AssetBTC, 8, HaskoinNetwork.BTC)

describe('haskoin api tests', () => {
  it(`Should fetch the balance for an address for haskoin`, async () => {
    const address = '1DEP8i3QJCsomS4BSMY2RpU1upv62aGvhD'
    const bal = await haskoinProvider.getBalance(address)
    console.log(bal[0].amount.amount().toNumber())
  })
  it(`Should getConfirmedUnspentTxs for an address using haskoin`, async () => {
    const address = 'bc1qcwnecmzdg0f0wwrjrmlelxfgvmjtqn7cal0dgx'
    const response = await haskoinProvider.getConfirmedUnspentTxs(address)
    console.log(response)
  })
  it(`Should getUnspentTxs for an address using haskoin`, async () => {
    const address = 'bc1qcwnecmzdg0f0wwrjrmlelxfgvmjtqn7cal0dgx'
    const response = await haskoinProvider.getUnspentTxs(address)
    console.log(response)
  })
  it(`Should getTransactions for an address using haskoin`, async () => {
    const address = 'bc1qcwnecmzdg0f0wwrjrmlelxfgvmjtqn7cal0dgx'
    const response = await haskoinProvider.getTransactions({ address })
    // console.log(JSON.stringify(response, null, 2))
    expect(response.total).toBe(6)
    expect(response.txs[0].hash).toBe('5df5a6a013273af53d9026d4335e25584b0c8f7c2c97aae0917767c58f902375')
    expect(response.txs[0].to[0].amount.amount().toFixed()).toBe('1086318')
    expect(response.txs[0].to[0].to).toBe('bc1qqy3gv233yf3pzycd204hetp6ku2y85yyuncef5')
    expect(response.txs[1].hash).toBe('a3db2a87dc086151630e4365c0ce6a9c17fc784ad7f7bf79cb6ecf5ced6d632f')
    // expect(response.txs[0].hash).toBe()
    expect(response.txs[2].hash).toBe('d519abaef1f0b27bf4b186ad241a81b5af1bcb9303f9936b4161ea8945c98416')
    expect(response.txs[3].hash).toBe('96ff66b8a710fe2dab1590680e415733d8942671fb3ca03569422e6a41eb5130')
    expect(response.txs[4].hash).toBe('2b1dd9108fe6e85c4b4e657efd9ec11ab1f7a2ac63e0d1e765f04dc6d50e4e33')
  })
  it(`Should getTransactions2 for an address haskoin`, async () => {
    const address = 'bc1q946qtg2fgk8hxgqgfe6tnpqg66yj5ex4jnkp2m'
    const response = await haskoinProvider.getTransactions({ address, offset: 0, limit: 5 })
    expect(response.total).toBe(5)
  })

  it(`Should getTransactionData for an address using haskoin`, async () => {
    const hash = 'D519ABAEF1F0B27BF4B186AD241A81B5AF1BCB9303F9936B4161EA8945C98416'
    const response = await haskoinProvider.getTransactionData(hash)
    expect(response.asset.chain).toBe(BTCChain)
    expect(response.asset.ticker).toBe('BTC')
    expect(response.date.getTime()).toBeLessThan(Date.now())
    expect(response.from[0].amount.amount().toFixed()).toBe('17212717169')
    expect(response.from[0].from).toBe('bc1q7868lfwycq4whds77dshf0hp7yqldj3nrx6jrt')
    expect(response.to[0].amount.amount().toFixed()).toBe('1973081')
    expect(response.to[0].to).toBe('bc1qcwnecmzdg0f0wwrjrmlelxfgvmjtqn7cal0dgx')
    // console.log(JSON.stringify(response, null, 2))
  })
})
