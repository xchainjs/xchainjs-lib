import { AssetZEC, ZECChain } from '@xchainjs/xchain-zcash/src'
import { NownodesProvider } from '../src/providers'

const nownodesProvider = new NownodesProvider(
  'https://zecbook.nownodes.io/api/v2',
  ZECChain,
  AssetZEC,
  8,
  process.env.NOWNODES_API_KEY as string
)

describe('nownodes api tests', () => {
  it(`Should fetch the balance for an address`, async () => {
    const address = 't1aVCAJMxUNLNAJFPmbLfZWkPWopf8aMyu9'
    const bal = await nownodesProvider.getBalance(address)
    expect(bal[0].amount.amount().toString()).toBe("40000000")
  })
  it(`Should getConfirmedUnspentTxs for an address`, async () => {
    const address = 't1aVCAJMxUNLNAJFPmbLfZWkPWopf8aMyu9'
    const response = await nownodesProvider.getConfirmedUnspentTxs(address)
    console.log(response)
  })
  it(`Should nownodes getUnspentTxs for an address`, async () => {
    const address = 't1eiZYPXWurGMxFwoTu62531s8fAiExFh88'
    const response = await nownodesProvider.getUnspentTxs(address)
    console.log(JSON.stringify(response, null, 2))
  })
  it(`Should getTransactions for an address`, async () => {
    const address = 't1aVCAJMxUNLNAJFPmbLfZWkPWopf8aMyu9'
    const response = await nownodesProvider.getTransactions({ address })
    console.log(JSON.stringify(response, null, 2))
  })
  it(`Should getTransactionData for an address`, async () => {
    const hash = '540e2dd5759dee24dc799d9097bbff7aa7334e1516b216014b6561e2d58c29f8'
    const response = await nownodesProvider.getTransactionData(hash)
    console.log(JSON.stringify(response, null, 2))
  })
  it(`Should fetch fee rates`, async () => {
    await expect(nownodesProvider.getFeeRates()).rejects.toThrow('Zcash has flat fees. Fee rates not apply')
  })
})
