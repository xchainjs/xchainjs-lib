import cosmosClientCore from '@cosmos-client/core'
import { Network, TxParams } from '@xchainjs/xchain-client'
import { AssetATOM, Client as CosmosClient } from '@xchainjs/xchain-cosmos'
import { assetAmount, assetToBase, assetToString, baseAmount, delay } from '@xchainjs/xchain-util'

let xchainClient: CosmosClient = new CosmosClient({})

describe('Cosmos Integration Tests', () => {
  beforeEach(() => {
    const settings = { network: Network.Testnet, phrase: process.env.TESTNET_PHRASE }
    xchainClient = new CosmosClient(settings)
  })
  it('should fetch cosmos balances', async () => {
    const address = xchainClient.getAddress(0)
    const balances = await xchainClient.getBalance(address)

    balances.forEach((bal) => {
      console.log(`${address} ${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })

  it('should generate cosmos addreses', async () => {
    const address0 = xchainClient.getAddress(0)
    const address1 = xchainClient.getAddress(1)

    expect(address0.length).toBeGreaterThan(0)
    expect(address0.startsWith('cosmos')).toBeTruthy()

    expect(address1.length).toBeGreaterThan(0)
    expect(address1.startsWith('cosmos')).toBeTruthy()
  })
  it('should transfer uatom from wallet 0 -> 1, with a memo', async () => {
    try {
      const addressTo = xchainClient.getAddress(2)
      const transferTx: TxParams = {
        walletIndex: 0,
        asset: AssetATOM,
        amount: baseAmount('100000', 6),
        recipient: addressTo,
        memo: 'Hi!',
      }
      const res = await xchainClient.transfer(transferTx)
      expect(res.length).toBeGreaterThan(0)
    } catch (error) {
      throw error
    }
  })
  // it('should fetch cosmos txs', async () => {
  //   const address = xchainClient.getAddress(0)
  //   const txPage = await xchainClient.getTransactions({ address })

  //   expect(txPage.total).toBeGreaterThan(0)
  //   expect(txPage.txs.length).toBeGreaterThan(0)
  // })
  it('should fail xfer 100000000000 from wallet 0 -> 1', async () => {
    try {
      const addressTo = xchainClient.getAddress(1)
      const transferTx: TxParams = {
        walletIndex: 0,
        asset: AssetATOM,
        amount: baseAmount('100000000000', 6),
        recipient: addressTo,
        memo: 'Hi!',
      }
      await delay(25 * 1000)
      const txHash = await xchainClient.transfer(transferTx)
      expect(txHash.length).toBeGreaterThan(0)

      // Wait 35 seconds for the tx to process
      await delay(15 * 1000)

      const txResult = await xchainClient.getSDKClient().txsHashGet(txHash)
      expect(txResult.raw_log?.includes('insufficient funds')).toBeTruthy()
    } catch (error) {
      throw error
    }
  })
  it('Prepate transaction, sign externally and broadcast', async () => {
    const sender = xchainClient.getAddress(2)
    const recipient = xchainClient.getAddress(0)

    console.log('sender', sender)
    console.log('recipient', recipient)

    const unsignedTxData = await xchainClient.prepareTx({
      sender,
      recipient,
      amount: assetToBase(assetAmount(0.09, 6)),
    })

    const decodedTx = cosmosClientCore.proto.cosmos.tx.v1beta1.TxRaw.decode(
      Buffer.from(unsignedTxData.rawUnsignedTx, 'base64'),
    )

    const privKey = xchainClient
      .getSDKClient()
      .getPrivKeyFromMnemonic(process.env.TESTNET_PHRASE as string, "44'/118'/0'/0/2")
    const authInfo = cosmosClientCore.proto.cosmos.tx.v1beta1.AuthInfo.decode(decodedTx.auth_info_bytes)

    if (!authInfo.signer_infos[0].public_key) {
      authInfo.signer_infos[0].public_key = cosmosClientCore.codec.instanceToProtoAny(privKey.pubKey())
    }

    const txBuilder = new cosmosClientCore.TxBuilder(
      xchainClient.getSDKClient().sdk,
      cosmosClientCore.proto.cosmos.tx.v1beta1.TxBody.decode(decodedTx.body_bytes),
      authInfo,
    )

    const { account_number: accountNumber } = await xchainClient
      .getSDKClient()
      .getAccount(cosmosClientCore.AccAddress.fromString(sender))

    if (!accountNumber) throw Error(`Transfer failed - missing account number`)

    const signDocBytes = txBuilder.signDocBytes(accountNumber)
    txBuilder.addSignature(privKey.sign(signDocBytes))

    const signedTx = txBuilder.txBytes()

    const hash = await xchainClient.broadcastTx(signedTx)

    console.log('hash', hash)
  })
})
