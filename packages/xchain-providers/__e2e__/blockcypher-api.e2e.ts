import { AssetBTC, BTCChain } from '../../xchain-bitcoin/src/const'
import { BlockcypherNetwork, BlockcypherProvider } from '../src/providers'

const blockcypherProvider = new BlockcypherProvider(
  'https://api.blockcypher.com/v1',
  BTCChain,
  AssetBTC,
  8,
  BlockcypherNetwork.BTC,
  process.env.BLOCKCYHER_API_TOKEN || undefined,
)

describe('blockcypher api tests', () => {
  it(`Should fetch the balance for an address`, async () => {
    const address = '1DEP8i3QJCsomS4BSMY2RpU1upv62aGvhD'
    const bal = await blockcypherProvider.getBalance(address)
    console.log(bal)
  })
  it(`Should getConfirmedUnspentTxs for an address`, async () => {
    const address = 'bc1qcwnecmzdg0f0wwrjrmlelxfgvmjtqn7cal0dgx'
    const response = await blockcypherProvider.getConfirmedUnspentTxs(address)
    console.log(response)
  })
  it(`Should getUnspentTxs for an address`, async () => {
    const address = 'bc1qcwnecmzdg0f0wwrjrmlelxfgvmjtqn7cal0dgx'
    const response = await blockcypherProvider.getUnspentTxs(address)
    console.log(response)
  })
  it(`Should getTransactions for an address`, async () => {
    const address = 'bc1qcwnecmzdg0f0wwrjrmlelxfgvmjtqn7cal0dgx'
    const response = await blockcypherProvider.getTransactions({ address })
    console.log(response)
  })
  it(`Should getTransactionData for an address`, async () => {
    const hash = 'D519ABAEF1F0B27BF4B186AD241A81B5AF1BCB9303F9936B4161EA8945C98416'
    const response = await blockcypherProvider.getTransactionData(hash)
    expect(response.asset.chain).toBe(BTCChain)
    expect(response.asset.ticker).toBe('BTC')
    expect(response.date.getTime()).toBeLessThan(Date.now())
    expect(response.from[0].amount.amount().toFixed()).toBe('17212717169')
    expect(response.from[0].from).toBe('bc1q7868lfwycq4whds77dshf0hp7yqldj3nrx6jrt')
    expect(response.to[0].amount.amount().toFixed()).toBe('1973081')
    expect(response.to[0].to).toBe('bc1qcwnecmzdg0f0wwrjrmlelxfgvmjtqn7cal0dgx')
    // console.log(JSON.stringify(response, null, 2))
  })
  it(`Should broadcastTx`, async () => {
    const txHex = 'xxx'
    const response = await blockcypherProvider.broadcastTx(txHex)
    console.log(response)
  })
})
