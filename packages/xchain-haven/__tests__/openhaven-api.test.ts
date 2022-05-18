import * as openhaven from '../src/haven/api'

xdescribe('Openhaven API Test', () => {
  const TestNetApiUrl = 'http://142.93.249.35:1984'

  // const mnenomonic = `haggled rekindle pimple pebbles dozen zippers perfect olympics
  // popular frying goblet gemstone snug dads factual loyal
  // balding annoyed lumber vary welders navy laboratory maverick olympics`

  const secretViewkey = '41198d176ecedf97d48481be2723e426991eece4dd136b5cdd26645aed3ac504'
  // const publicViewkey = '770a38f508ae11fd50d74cc00aa3eeb947c4eca3f5d7b4664100e76847977d95'

  const address = 'hvtaKeraSrv8KGdn7Vp6qsQwBZLkKVQAi5fMuVynVe8HE9h7B8gdjQpMeGC1QHm4G25TBNcaXHfzSbe4G8uGTF6b5FoNTbnY5z'
  let txHash: string | undefined

  beforeAll(async () => {
    openhaven.setAPI_URL(TestNetApiUrl)
    openhaven.setCredentials(address, secretViewkey)
    openhaven.login(false)
    // done()
  })

  it('returns version', async () => {
    const version = await openhaven.get_version()
    console.log(version)
    expect(version.testnet).toBeTruthy()
    expect(version.fork_version).toBeGreaterThan(15)
    expect(version.per_byte_fee).toBeGreaterThan(0)
  })

  // it('login/create account', async () => {
  //   const loginResponse = await openhaven.login(false)
  //   expect(loginResponse.status).toBe('success')
  // })

  it('get address info', async () => {
    const addressInnfo = await openhaven.getAddressInfo()
    expect(addressInnfo.status).toBe('success')
  })

  it('get txs data', async () => {
    const addressTxs = await openhaven.getAddressTxs()
    expect(addressTxs.status).toBe('success')
    expect(addressTxs.transactions.length).toBeGreaterThan(0)
    txHash = addressTxs.transactions[0].hash
  })
  it('get tx info', async () => {
    expect(txHash).toBeDefined()
    const txInfo = await openhaven.getTx(txHash!)
    expect(txInfo.status).toBe('success')
  })

  it('keep search thread alive', async () => {
    const pingResponse = await openhaven.keepAlive()
    expect(pingResponse.status).toBe('success')
  })
})
