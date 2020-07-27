require('dotenv').config()
import { Client, Network } from '../src/client'

describe('BitcoinClient Test', () => {
  const net = Network.MAIN
  const phrase = process.env.VAULT_PHRASE
  const btcClient = new Client(net)
  let address: string
  // const valueOut = 99000
  // const MEMO = 'SWAP:THOR.RUNE'
  // const addressTo = process.env.USER_BTC

  it('should have right prefix', () => {
    const network = btcClient.getNetwork(net)
    expect(network.bech32).toEqual('bc')
  })

  it('should update net', () => {
    const net = Network.TEST
    btcClient.setNetwork(net)
    const network = btcClient.getNetwork(net)
    expect(network.bech32).toEqual('tb')
  })

  it('should generate a valid phrase', () => {
    const _phrase = btcClient.generatePhrase()
    const valid = btcClient.validatePhrase(_phrase)
    expect(valid).toBeTruthy()
  })

  it('should validate phrase', () => {
    if (phrase) {
      const valid = btcClient.validatePhrase(phrase)
      expect(valid).toBeTruthy()
    }
  })

  it('should throw an error for setting a bad phrase', () => {
    if (phrase) {
      expect(() => { btcClient.setPhrase('cat') }).toThrow()
    }
  })

  it('should not throw an error for setting a good phrase', () => {
    if (phrase) {
      expect(btcClient.setPhrase(phrase)).toBeUndefined;
    }
  })

  it('should validate the right address', () => {
    address = btcClient.getAddress()
    const valid = btcClient.validateAddress(address)
    expect(address).toEqual('tb1qzglk2c42q376utfc2dejwktvmr57yxfja0edrp')
    expect(valid).toBeTruthy()
  })

  // it('should get the right balance', async () => {
  //   await btcClient.scanUTXOs(address)
  //   const balance = btcClient.getBalance()
  //   expect(balance).toEqual(valueOut)
  // })

  // it('should get the right history', async () => {
  //   const txArray = await btcClient.getTransactions(address)
  //   expect(txArray[0]).toEqual('7fc1d2c1e4017a6aea030be1d4f5365d11abfd295f56c13615e49641c55c54b8')
  // })

  // it('should do the a normal tx', async () => {
  //   if (addressTo !== undefined) {
  //     const hex = await btcClient.normalTx(addressTo, valueOut, 1)
  //     expect(hex).toEqual(
  //       '02000000000101b8545cc54196e41536c1565f29fdab115d36f5d4e10b03ea6a7a01e4c1d2c17f0000000000ffffffff012b82010000000000160014a63674f00480abf2dfbbaf5b1a07658af5bcf6780248304502210097fa99fb7c7c347e526ce00ec0593fc647e58db50d78d3af18f265f8c600a85702201433baa2cbdee2e6ebfb429c6dcfeccef175e6823faecfebd94376a0ab7efdf0012102831eb18021fd7224b385bb11502d2ff0aa73229e177885289690d0c726c1976300000000',
  //     )
  //   }
  // })

  // it('should do the vault tx', async () => {
  //   if (addressTo !== undefined) {
  //     const hex = await btcClient.vaultTx(addressTo, valueOut, MEMO, 1)
  //     expect(hex).toEqual(
  //       '02000000000101b8545cc54196e41536c1565f29fdab115d36f5d4e10b03ea6a7a01e4c1d2c17f0000000000ffffffff021282010000000000160014a63674f00480abf2dfbbaf5b1a07658af5bcf6780000000000000000106a0e535741503a54484f522e52554e45024830450221008e8fb2a690f9f575e1ef9cf3d4a1147ffb60c71c3195c95829793832fde4cf8402206462de6b27e97abf5dfab6aba25527a62b6e75a9737881ca3380d238aad0b985012102831eb18021fd7224b385bb11502d2ff0aa73229e177885289690d0c726c1976300000000',
  //     )
  //   }
  // })
})
