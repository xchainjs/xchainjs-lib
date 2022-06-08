import * as openhaven from '../src/haven/api'

describe('Openhaven API Test', () => {
  const TestNetApiUrl = 'http://142.93.249.35:1984'

  const secretViewkey = '41198d176ecedf97d48481be2723e426991eece4dd136b5cdd26645aed3ac504'
  const address = 'hvtaKeraSrv8KGdn7Vp6qsQwBZLkKVQAi5fMuVynVe8HE9h7B8gdjQpMeGC1QHm4G25TBNcaXHfzSbe4G8uGTF6b5FoNTbnY5z'
  const firstTxHash = '4d4f7a5c151a7bf927388adc9d146eb9662338f52561241c48ffa127cc80733f'

  beforeAll(async () => {
    openhaven.setAPI_URL(TestNetApiUrl)
    openhaven.setCredentials(address, secretViewkey)
    openhaven.login(false)
  })

  it('returns version', async () => {
    const version = await openhaven.get_version()
    expect(version.testnet).toBeTruthy()
    expect(version.fork_version).toBeGreaterThan(15)
    expect(version.per_byte_fee).toBeGreaterThan(0)
  })

  it('get address info', async () => {
    const addressInnfo = await openhaven.getAddressInfo()
    expect(addressInnfo.status).toBe('success')
  })

  it('get txs data', async () => {
    const addressTxs = await openhaven.getAddressTxs()
    expect(addressTxs.status).toBe('success')
    expect(addressTxs.transactions.length).toBeGreaterThan(0)
    const txHash = addressTxs.transactions[0].hash
    expect(firstTxHash).toEqual(txHash)
  })

  it('get tx info', async () => {
    const txInfo = await openhaven.getTx(firstTxHash)
    expect(txInfo.status).toBe('success')
  })

  it('keep search thread alive', async () => {
    const pingResponse = await openhaven.keepAlive()
    expect(pingResponse.status).toBe('success')
  })
})
