import BigNumber from 'bignumber.js'
import { SerializedTransaction } from 'haven-core-js'

import mockopenhaven from '../__mocks__/open-haven'
import { HavenCoreClient } from '../src/haven/haven-core-client'
import { HavenBalance, NetTypes, SyncObserver, SyncStats } from '../src/haven/types'

const client = new HavenCoreClient()

xdescribe('Haven Core Client Tests', () => {
  let balance: HavenBalance

  const mnenomonic =
    'juvenile kickoff king glass scoop lair iris token truth puzzled amaze corrode justice autumn pimple turnip cafe oyster hover baffles giddy farming vector western pimple'

  //const secretViewkey = '34975f014cde57cf52f6aec3e91aab35af427f4a8a2002acebe7b45e634d7304'
  // const publicViewkey = '770a38f508ae11fd50d74cc00aa3eeb947c4eca3f5d7b4664100e76847977d95'

  const address = 'hvtaKeraSrv8KGdn7Vp6qsQwBZLkKVQAi5fMuVynVe8HE9h7B8gdjQpMeGC1QHm4G25TBNcaXHfzSbe4G8uGTF6b5FoNTbnY5z'

  beforeAll(async () => {
    await client.preloadModule()
    mockopenhaven.init()
  })

  it('should init haven core client without error', async () => {
    const response = await client.init(mnenomonic, NetTypes.testnet)
    expect(response).toBeTruthy()
  })

  it('should return correct address', () => {
    const response = client.getAddress()
    expect(response).toBe(address)
  })

  it('should validate address', () => {
    const isValid = client.validateAddress(
      'hvtaKeraSrv8KGdn7Vp6qsQwBZLkKVQAi5fMuVynVe8HE9h7B8gdjQpMeGC1QHm4G25TBNcaXHfzSbe4G8uGTF6b5FoNTbnY5z',
    )
    expect(isValid).toBeTruthy()
  })
  it('should invalidate address', () => {
    const isValid = client.validateAddress('drlgjrnvkrsuvusekhvusehvuhksuevksekuvhseuvhskedueahdkeaudhakuedhk')
    expect(isValid).toBeFalsy()
  })

  it('should return balance', async () => {
    balance = await client.getBalance()
    expect(new BigNumber(balance.XUSD.balance).isGreaterThan(0))
  })

  it('should return transaction history', async () => {
    const transactions: SerializedTransaction[] = await client.getTransactions()
    expect(transactions.length).toBeGreaterThan(0)
  })

  xit('should transfer funds', async () => {
    // is equal to 0.1 XHV
    const transferAmount = new BigNumber(10).exponentiatedBy(12).dividedBy(100)
    const response = await client.transfer(transferAmount.toString(), 'XHV', address)
    expect(typeof response).toBe('string')
    expect(response).not.toBe('')
  })

  it('should transfer funds with memo', async () => {
    // is equal to 0.1 XHV
    const transferAmount = new BigNumber(10).exponentiatedBy(12).dividedBy(100)
    const response = await client.transfer(transferAmount.toString(), 'XHV', address, 'SWAP:THOR.RUNE')
    expect(typeof response).toBe('string')
    expect(response).not.toBe('')
  })

  xit('should return fees', async () => {
    // testing from low to high priority
    const defaultFees = parseFloat(await client.estimateFees(1))
    expect(defaultFees).toBeGreaterThan(0)
    const lowFees = parseFloat(await client.estimateFees(2))
    expect(lowFees).toBeGreaterThan(0)
    const fastFees = parseFloat(await client.estimateFees(3))
    expect(fastFees).toBeGreaterThan(0)
    const fastestFees = parseFloat(await client.estimateFees(4))
    expect(fastestFees).toBeGreaterThan(0)

    expect(fastestFees).toBeGreaterThan(fastFees)

    expect(fastFees).toBeGreaterThan(lowFees)

    expect(fastFees).toBeGreaterThan(defaultFees)
  })

  it('should create a new haven wallet', async () => {
    const newMnemonic = await HavenCoreClient.createWallet(NetTypes.testnet)
    expect(typeof newMnemonic).toBe('string')
    expect(newMnemonic).not.toBe('')
  })

  xit('should sync a new wallet over time', async (done) => {
    const newMnemonic = await HavenCoreClient.createWallet(NetTypes.testnet)

    await client.init(newMnemonic, NetTypes.testnet)

    const observer: SyncObserver = {
      next: (syncState: SyncStats) => {
        expect(syncState.syncedHeight).toBeGreaterThanOrEqual(0)
        expect(syncState.blockHeight).toBeGreaterThan(0)
      },
      complete: (syncState: SyncStats) => {
        expect(syncState.blockHeight).toBe(syncState.syncedHeight)

        done()
      },
      error: (_errMessage: string) => {
        done()
      },
    }

    client.subscribeSyncProgress(observer)
  }, 100000)
})
