import { Network, Protocol } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { BCH_DECIMAL, Client, defaultBchParams } from '../src'

describe('BCH e2e tests', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      ...defaultBchParams,
      network: Network.Mainnet,
      phrase: process.env.MAINNET_PHRASE,
    })
  })

  it('Should get address 0 async', async () => {
    try {
      const address = await client.getAddressAsync()
      console.log(address)
    } catch (error) {
      console.error(`Error running "Should get address 0 async". ${error}`)
      fail()
    }
  })

  it('Should get fees', async () => {
    try {
      const fees = await client.getFees({
        sender: 'qzzp3027eteuj29lkgx4dphg86grd04frgtn2ngukd',
      })
      console.log({
        type: fees.type,
        average: {
          amount: fees.average.amount().toString(),
          decimals: fees.average.decimal,
        },
        fast: {
          amount: fees.fast.amount().toString(),
          decimals: fees.fast.decimal,
        },
        fastest: {
          amount: fees.fastest.amount().toString(),
          decimals: fees.fastest.decimal,
        },
      })
    } catch (error) {
      console.error(`Should get fees". ${error}`)
      fail()
    }
  })

  it('Should fetch fee rates from provider', async () => {
    try {
      const feeRates = await client.getFeeRates()
      console.log(feeRates)
    } catch (error) {
      console.error(`Error running "Should fetch fee rates from provider". ${error}`)
      fail()
    }
  })

  it('Should fetch fee rates from Thorchain', async () => {
    try {
      const feeRates = await client.getFeeRates(Protocol.THORCHAIN)
      console.log(feeRates)
    } catch (error) {
      console.error(`Error running "Should fetch fee rates from Thorchain". ${error}`)
      fail()
    }
  })

  it('Should self transfer', async () => {
    try {
      const txHash = await client.transfer({
        recipient: await client.getAddressAsync(0),
        amount: assetToBase(assetAmount('0.001', BCH_DECIMAL)),
      })
      console.log(txHash)
    } catch (error) {
      console.error(`Error running "Should self transfer". ${error}`)
      fail()
    }
  })

  it('Should self transfer with average fee option', async () => {
    try {
      const feeRates = await client.getFeeRates()
      const txHash = await client.transfer({
        recipient: await client.getAddressAsync(0),
        amount: assetToBase(assetAmount('0.001', BCH_DECIMAL)),
        feeRate: feeRates.average,
      })
      console.log(txHash)
    } catch (error) {
      console.error(`Error running "Should self transfer". ${error}`)
      fail()
    }
  })
})
