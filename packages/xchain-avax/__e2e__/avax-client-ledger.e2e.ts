import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, AssetType, baseAmount, TokenAsset } from '@xchainjs/xchain-util'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'

import { ClientLedger } from '../src'
import { AVAXChain, defaultAvaxParams } from '../src/const'

defaultAvaxParams.network = Network.Mainnet
defaultAvaxParams.phrase = process.env.MAINNET_PHRASE

const assetUSDC: TokenAsset = {
  chain: AVAXChain,
  symbol: `USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E`,
  ticker: `USDC`,
  type: AssetType.TOKEN,
}

describe('xchain-evm (Avax) Integration Tests', () => {
  let client: ClientLedger
  beforeAll(async () => {
    const transport = await TransportNodeHid.create()
    client = new ClientLedger({
      transport,
      ...defaultAvaxParams,
    })
  })

  it('should get address', async () => {
    const address = await client.getAddressAsync()
    console.log(address)
  })
  it('should transfer 0.01 AVAX between wallet 0 and 1, with a memo', async () => {
    const recipient = await client.getAddressAsync(1)
    console.log('recipient', recipient)
    const amount = assetToBase(assetAmount('0.01', 18))
    const memo = `=:BNB.BUSD-BD1:bnb1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:100000000000`
    const txHash = await client.transfer({ amount, recipient, memo })
    console.log(txHash)
  })
  it('should transfer 0.01 AVAX following EIP1559 because of maxFeePerGas', async () => {
    const recipient = await client.getAddressAsync(1)
    const amount = assetToBase(assetAmount('0.01', 18))
    const txHash = await client.transfer({
      amount,
      recipient,
      maxFeePerGas: baseAmount('51700000000', 18),
    })
    console.log(txHash)
  })
  it('should transfer 0.01 AVAX following EIP1559 because of maxPriorityFeePerGas', async () => {
    const recipient = await client.getAddressAsync(1)
    const amount = assetToBase(assetAmount('0.01', 18))
    const txHash = await client.transfer({
      amount,
      recipient,
      maxPriorityFeePerGas: baseAmount('1700000000', 18),
    })
    console.log(txHash)
  })
  it('should transfer 1 USDC between wallet 0 and 1', async () => {
    const recipient = await client.getAddressAsync(1)
    const amount = assetToBase(assetAmount('0.01', 18))

    const txHash = await client.transfer({ amount, recipient, asset: assetUSDC })
    console.log(txHash)
  })
  it('should approve 1 USDC between wallet 0 and 1', async () => {
    const recipient = await client.getAddressAsync(1)
    const amount = assetToBase(assetAmount('0.01', 6))

    const txHash = await client.approve({
      amount,
      contractAddress: '0x224695ba2a98e4a096a519b503336e06d9116e48',
      spenderAddress: recipient,
    })
    console.log(txHash)
  })
})
