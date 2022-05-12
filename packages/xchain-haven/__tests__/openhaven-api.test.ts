import * as openhaven from '../src/haven/api'

xdescribe('Openhaven API Test', () => {
  const TestNetApiUrl = 'http://142.93.249.35:1984'

  // const mnenomonic = `haggled rekindle pimple pebbles dozen zippers perfect olympics
  // popular frying goblet gemstone snug dads factual loyal
  // balding annoyed lumber vary welders navy laboratory maverick olympics`

  const secretViewkey = '34975f014cde57cf52f6aec3e91aab35af427f4a8a2002acebe7b45e634d7304'
  // const publicViewkey = '770a38f508ae11fd50d74cc00aa3eeb947c4eca3f5d7b4664100e76847977d95'

  const address = 'hvta6D5QfukiUdeidKdRw4AQ9Ddvt4o9e5jPg2CzkGhdeQGkZkU4RKDW7hajbbBLwsURMLu3S3DH6d5c8QYVYYSA6jy6XRzfPv'
  let txHash: string | undefined

  beforeAll(() => {
    openhaven.setAPI_URL(TestNetApiUrl)
    openhaven.setCredentials(address, secretViewkey)
  })

  it('returns version', async () => {
    const version = await openhaven.get_version()
    console.log(version)
    expect(version.testnet).toBeTruthy()
    expect(version.fork_version).toBeGreaterThan(15)
    expect(version.per_byte_fee).toBeGreaterThan(0)
  })

  it('login/create account', async () => {
    const loginResponse = await openhaven.login(false)
    expect(loginResponse.status).toBe('success')
  })

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
    console.log(txInfo)
    expect(txInfo.status).toBe('success')
  })

  it('keep search thread alive', async () => {
    const pingResponse = await openhaven.keepAlive()
    console.log(pingResponse)
    expect(pingResponse.status).toBe('success')
  })
})
