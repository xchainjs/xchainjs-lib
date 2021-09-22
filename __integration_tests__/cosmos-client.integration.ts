// import { Network, TxParams, XChainClient } from '@xchainjs/xchain-client'
// import { Client as CosmosClient } from '@xchainjs/xchain-cosmos'
// import { Chain, assetToString, baseAmount } from '@xchainjs/xchain-util'
import { cosmosclient, proto, rest } from 'cosmos-client'

describe('bank', () => {
  it('send', async () => {
    expect.hasAssertions()

    const sdk = new cosmosclient.CosmosSDK('https://api.testnet.cosmos.network', 'cosmoshub-testnet')

    const privKey = new proto.cosmos.crypto.secp256k1.PrivKey({
      key: await cosmosclient.generatePrivKeyFromMnemonic(process.env.PHRASE || ''),
    })
    const pubKey = privKey.pubKey()
    const address = cosmosclient.AccAddress.fromPublicKey(pubKey)

    expect(address.toString()).toStrictEqual('cosmos15yuxxfwzu5y5tvhrl4lws6hh925pgul025myjl')

    const fromAddress = address
    const toAddress = address

    // get account info
    const account = await rest.cosmos.auth
      .account(sdk, fromAddress)
      .then((res) => res.data.account && cosmosclient.codec.unpackCosmosAny(res.data.account))
      .catch((_) => undefined)

    if (!(account instanceof proto.cosmos.auth.v1beta1.BaseAccount)) {
      console.log(account)
      return
    }

    // build tx
    const msgSend = new proto.cosmos.bank.v1beta1.MsgSend({
      from_address: fromAddress.toString(),
      to_address: toAddress.toString(),
      amount: [{ denom: 'uphoton', amount: '1000' }],
    })

    const txBody = new proto.cosmos.tx.v1beta1.TxBody({
      messages: [cosmosclient.codec.packAny(msgSend)],
    })
    const authInfo = new proto.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [
        {
          public_key: cosmosclient.codec.packAny(pubKey),
          mode_info: {
            single: {
              mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
            },
          },
          sequence: account.sequence,
        },
      ],
      fee: {
        gas_limit: cosmosclient.Long.fromString('200000'),
      },
    })

    // sign
    const txBuilder = new cosmosclient.TxBuilder(sdk, txBody, authInfo)
    const signDocBytes = txBuilder.signDocBytes(account.account_number)
    txBuilder.addSignature(privKey.sign(signDocBytes))

    // broadcast
    try {
      const res = await rest.cosmos.tx.broadcastTx(sdk, {
        tx_bytes: txBuilder.txBytes(),
        mode: rest.cosmos.tx.BroadcastTxMode.Block,
      })
      console.log(res)
      expect(res.data.tx_response?.raw_log?.match('failed')).toBeFalsy()
    } catch (error) {
      console.log(error)
    }
  })
})

// let xchainClient: XChainClient = new CosmosClient({})

// describe('Cosmos Integration Tests', () => {
//   beforeEach(() => {
//     const settings = { network: 'testnet' as Network, phrase: process.env.PHRASE }
//     xchainClient = new CosmosClient(settings)
//   })
//   it('should fetch cosmos balances', async () => {
//     const address = xchainClient.getAddress(0)
//     const balances = await xchainClient.getBalance(address)
//     balances.forEach((bal) => {
//       console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
//     })
//     expect(balances.length).toBeGreaterThan(0)
//   })

//   it('should generate cosmos addreses', async () => {
//     const address0 = xchainClient.getAddress(0)
//     const address1 = xchainClient.getAddress(1)
//     // const balances = await xchainClients.THOR.getBalance(address)
//     console.log(address0)
//     console.log(address1)
//   })

//   it('should xfer atom from wallet 0 -> 1, with a memo', async () => {
//     try {
//       const addressTo = xchainClient.getAddress(1)
//       const transferTx: TxParams = {
//         walletIndex: 0,
//         asset: { chain: Chain.Cosmos, ticker: 'GAIA', symbol: 'MUON' },
//         amount: baseAmount('1000000'),
//         // 100000000
//         recipient: addressTo,
//         // memo: 'Hi!',
//       }
//       const hash = await xchainClient.transfer(transferTx)
//       expect(hash.length).toBeGreaterThan(0)
//       console.log(xchainClient.getExplorerTxUrl(hash))
//     } catch (error) {
//       console.log(error)
//       throw error
//     }
//   })
// })
