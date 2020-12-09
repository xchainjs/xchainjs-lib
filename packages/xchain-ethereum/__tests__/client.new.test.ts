import Client from '../src/client'
import { mockDashboardAddress } from '../__mocks__/blockchair-api'

/**
 * Test Data
 * @todo import from .ts
 */
const phrase = 'canyon throw labor waste awful century ugly they found post source draft'
// const address = '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E'
const vault = '0x8c2A90D36Ec9F745C9B28B588Cba5e2A978A1656'
const blockchairUrl = {
  testnet: 'https://api.blockchair.com/ethereum/testnet',
  mainnet: 'https://api.blockchair.com/ethereum',
}

describe('Balances', () => {
  it('has no balances', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
      blockchairUrl: blockchairUrl.testnet,
      vault,
    })

    mockDashboardAddress(blockchairUrl.testnet, ethClient.getAddress(), {
      '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E': {
        address: {
          balance_usd: 0,
          received_approximate: '0',
          received_usd: 0,
          spent_approximate: '0',
          spent_usd: 0,
          fees_approximate: '0',
          fees_usd: 0,
          receiving_call_count: 0,
          spending_call_count: 0,
          call_count: 0,
          transaction_count: 0,
        },
        calls: [],
      },
    })

    const balances = await ethClient.getBalance()

    expect(balances.length).toEqual(1)
    expect(balances[0].amount.amount().toString()).toEqual('0')
  })
})
