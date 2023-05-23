import { AssetBTC, BTCChain } from '../../xchain-bitcoin/src/const'
import { SochainNetwork, SochainProvider } from '../src/providers'

const sochainProvider = new SochainProvider(
  'https://sochain.com/api/v3',
  process.env.SOCHAIN_API_KEY || 'undefined',
  BTCChain,
  AssetBTC,
  8,
  SochainNetwork.BTC,
)

describe('sochain api tests', () => {
  it(`Should fetch the balance for an address`, async () => {
    const address = '1DEP8i3QJCsomS4BSMY2RpU1upv62aGvhD'
    const bal = await sochainProvider.getBalance(address)
    console.log(bal)
  })
  it(`Should getConfirmedUnspentTxs for an address`, async () => {
    const address = 'bc1qcwnecmzdg0f0wwrjrmlelxfgvmjtqn7cal0dgx'
    const response = await sochainProvider.getConfirmedUnspentTxs(address)
    console.log(response)
  })
  it(`Should sochain getUnspentTxs for an address`, async () => {
    const address = 'bc1qcwnecmzdg0f0wwrjrmlelxfgvmjtqn7cal0dgx'
    const response = await sochainProvider.getUnspentTxs(address)
    console.log(JSON.stringify(response, null, 2))
  })
  it(`Should getTransactions for an address`, async () => {
    const address = 'bc1qcwnecmzdg0f0wwrjrmlelxfgvmjtqn7cal0dgx'
    const response = await sochainProvider.getTransactions({ address })
    // console.log(JSON.stringify(response, null, 2))
    expect(response.total).toBe(5)
    expect(response.txs[0].hash).toBe('a3db2a87dc086151630e4365c0ce6a9c17fc784ad7f7bf79cb6ecf5ced6d632f')
    expect(response.txs[0].to[0].amount.amount().toFixed()).toBe('1966386')
    expect(response.txs[0].to[0].to).toBe('bc1qcwnecmzdg0f0wwrjrmlelxfgvmjtqn7cal0dgx')
    expect(response.txs[1].hash).toBe('d519abaef1f0b27bf4b186ad241a81b5af1bcb9303f9936b4161ea8945c98416')
    // expect(response.txs[0].hash).toBe()
    expect(response.txs[2].hash).toBe('96ff66b8a710fe2dab1590680e415733d8942671fb3ca03569422e6a41eb5130')
    expect(response.txs[3].hash).toBe('2b1dd9108fe6e85c4b4e657efd9ec11ab1f7a2ac63e0d1e765f04dc6d50e4e33')
    expect(response.txs[4].hash).toBe('1a6a6f5dc21c7cfe06e6ab4aaba0bc3c51cdfa8461fd24fc3e3f15c782bacdc3')
  })
  it(`Should getTransactions2 for an address`, async () => {
    const address = 'bc1q946qtg2fgk8hxgqgfe6tnpqg66yj5ex4jnkp2m'
    const response = await sochainProvider.getTransactions({ address, offset: 0, limit: 5 })
    expect(response.total).toBe(5)
  })

  it(`Should getTransactionData for an address`, async () => {
    const hash = 'D519ABAEF1F0B27BF4B186AD241A81B5AF1BCB9303F9936B4161EA8945C98416'
    const response = await sochainProvider.getTransactionData(hash)
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
