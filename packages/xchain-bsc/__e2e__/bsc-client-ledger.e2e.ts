import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, AssetType, TokenAsset } from '@xchainjs/xchain-util'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'

import { ClientLedger } from '../src'
import { BSCChain, defaultBscParams } from '../src/const'

defaultBscParams.network = Network.Mainnet
defaultBscParams.phrase = process.env.MAINNET_PHRASE

const assetUSDC: TokenAsset = {
  chain: BSCChain,
  symbol: `USDC-0X8AC76A51CC950D9822D68B83FE1AD97B32CD580D`,
  ticker: `USDC`,
  type: AssetType.TOKEN,
}

describe('xchain-evm (BNB) Integration Tests', () => {
  let client: ClientLedger
  beforeAll(async () => {
    const transport = await TransportNodeHid.create()
    client = new ClientLedger({
      transport,
      ...defaultBscParams,
    })
  })

  it('should get address', async () => {
    const address = await client.getAddressAsync(0)
    console.log(address)
  })
  it('should transfer 0.02 BNB between wallet 0 and 1, with a memo', async () => {
    const recipient = await client.getAddressAsync(1)
    console.log('recipient', recipient)
    const amount = assetToBase(assetAmount('0.02', 18))
    const memo = `=:BNB.BUSD-BD1:bnb1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:100000000000`
    const txHash = await client.transfer({ amount, recipient, memo })
    console.log(txHash)
  })
  it('should transfer 1 USDC between wallet 0 and 1', async () => {
    const recipient = await client.getAddressAsync(1)
    const amount = assetToBase(assetAmount('1', 18))

    const txHash = await client.transfer({ amount, recipient, asset: assetUSDC })
    console.log(txHash)
  })
})
