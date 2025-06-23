import { StdFee } from '@cosmjs/amino'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import {
  DecodedTxRaw,
  DirectSecp256k1HdWallet,
  EncodeObject,
  coins,
  decodeTxRaw,
  makeCosmoshubPath,
} from '@cosmjs/proto-signing'
import { SigningStargateClient } from '@cosmjs/stargate'
import { Network, Tx } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, assetToString, baseToAsset } from '@xchainjs/xchain-util'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import { COSMOS_DECIMAL, Client, getDefaultClientUrls } from '../src'

const getPrintableTx = (tx: Tx) => {
  return {
    hash: tx.hash,
    date: tx.date.toDateString(),
    asset: assetToString(tx.asset),
    type: tx.type,
    from: tx.from.map((sender) => {
      return {
        from: sender.from,
        asset: sender.asset ? assetToString(sender.asset) : 'undefined',
        amount: baseToAsset(sender.amount).amount().toString(),
      }
    }),
    to: tx.to.map((recipient) => {
      return {
        to: recipient.to,
        asset: recipient.asset ? assetToString(recipient.asset) : 'undefined',
        amount: baseToAsset(recipient.amount).amount().toString(),
      }
    }),
  }
}

describe('Cosmos client e2e', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      network: Network.Mainnet,
      phrase: process.env.PHRASE_MAINNET,
    })
  })

  it('Should get wallet address', async () => {
    const address = await client.getAddressAsync()
    console.log(address)
  })

  it('Should get address balances', async () => {
    const balances = await client.getBalance(await client.getAddressAsync())
    console.log(
      balances.map((balance) => {
        return {
          asset: assetToString(balance.asset),
          amount: baseToAsset(balance.amount).amount().toString(),
        }
      }),
    )
  })

  it('Should get address transaction history', async () => {
    const history = await client.getTransactions({ address: await client.getAddressAsync() })
    console.log({ total: history.total })
    history.txs.forEach((tx) => {
      console.log(getPrintableTx(tx))
    })
  })

  it('Should get transaction', async () => {
    const tx = await client.getTransactionData('4147CEDEA45C7D8DED36575AB8A3579693BBA00B7A2B5398FADAF874FB758BFC')
    console.log(getPrintableTx(tx))
  })

  it('Should prepare transaction', async () => {
    const unsignedTx = await client.prepareTx({
      sender: await client.getAddressAsync(0),
      recipient: await client.getAddressAsync(1),
      amount: assetToBase(assetAmount(0.1, COSMOS_DECIMAL)),
      memo: 'test',
    })
    console.log(unsignedTx)
  })

  it('Should make transfer to address 1', async () => {
    const hash = await client.transfer({
      recipient: await client.getAddressAsync(1),
      amount: assetToBase(assetAmount(0.1, COSMOS_DECIMAL)),
      memo: 'test',
    })
    console.log(hash)
  })

  it('Should transfer offline', async () => {
    const txRaw = await client.transferOffline({
      walletIndex: 0,
      recipient: await client.getAddressAsync(0),
      amount: assetToBase(assetAmount(0.1, COSMOS_DECIMAL)),
    })
    console.log(txRaw)
  })

  it('Should prepare transaction, sign externally and broadcast', async () => {
    const senderIndex = 0
    const sender = await client.getAddressAsync(senderIndex)
    const recipient = await client.getAddressAsync(1)
    const memo = 'test'

    const { rawUnsignedTx } = await client.prepareTx({
      sender,
      recipient,
      amount: assetToBase(assetAmount(0.1, 6)),
      memo,
    })

    const unsignedTx: DecodedTxRaw = decodeTxRaw(fromBase64(rawUnsignedTx))

    const signer = await DirectSecp256k1HdWallet.fromMnemonic(process.env.PHRASE_MAINNET as string, {
      hdPaths: [makeCosmoshubPath(senderIndex)],
    })
    const signingClient = await SigningStargateClient.connectWithSigner(
      getDefaultClientUrls()[Network.Mainnet][0],
      signer,
    )

    const messages: EncodeObject[] = unsignedTx.body.messages.map((message) => {
      return { typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: signingClient.registry.decode(message) }
    })

    const feeAmount = coins(2000, 'uatom')
    const gasLimit = 200000

    const stdFee: StdFee = {
      amount: feeAmount,
      gas: gasLimit.toString(),
    }

    const txRaw = await signingClient.sign(sender, messages, stdFee, memo)
    const txRawBytes = TxRaw.encode(txRaw).finish()
    const signedRawTransaction = toBase64(txRawBytes)

    const hash = await client.broadcastTx(signedRawTransaction)
    console.log(hash)
  })
})
