import { Network } from '@xchainjs/xchain-client/src'
import { RadixClient } from '@xchainjs/xchain-radix/src'

describe('RadixClient Test', () => {
  let radixClient: RadixClient
  const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
  const params = {
    network: Network.Mainnet,
  }

  beforeEach(async () => {
    radixClient = new RadixClient(phrase, params)
  })

  afterEach(async () => {
    radixClient.purgeClient()
  })

  it('should start with empty wallet', async () => {
    console.log(radixClient)
  })
})
