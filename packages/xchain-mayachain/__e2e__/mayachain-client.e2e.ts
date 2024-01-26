import { Tx } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, assetToString, baseToAsset } from '@xchainjs/xchain-util'

import { AssetCacao, Client, DepositTx } from '..'

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

const getPrintableDepositTx = (depositTx: DepositTx) => {
  return {
    hash: depositTx.hash,
    asset: assetToString(depositTx.asset),
    type: depositTx.type,
    from: depositTx.from.map((sender) => {
      return {
        from: sender.from,
        asset: sender.asset ? assetToString(sender.asset) : 'undefined',
        amount: baseToAsset(sender.amount).amount().toString(),
      }
    }),
    to: depositTx.to.map((recipient) => {
      return {
        to: recipient.to,
        asset: recipient.asset ? assetToString(recipient.asset) : 'undefined',
        amount: baseToAsset(recipient.amount).amount().toString(),
      }
    }),
  }
}

describe('Thorchain client e2e', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      phrase: process.env.PHRASE_MAINNET,
    })
  })

  it('Should get private key', async () => {
    const privateKey = await client.getPrivateKey(0)
    console.log(privateKey)
  })

  it('Should get public key', async () => {
    const publicKey = await client.getPubKey(0)
    console.log(publicKey)
  })

  it('Should get address', async () => {
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
    const tx = await client.getTransactionData('796D37DBB13F1A7EB86720832A4F395729F9AAFC953DC576795BEEE3FC4EBEC6')
    console.log(getPrintableTx(tx))
  })

  it('Should get deposit transaction', async () => {
    const tx = await client.getDepositTransaction('796D37DBB13F1A7EB86720832A4F395729F9AAFC953DC576795BEEE3FC4EBEC6')
    console.log(getPrintableDepositTx(tx))
  })

  it('Should prepare transaction', async () => {
    const unsignedTx = await client.prepareTx({
      sender: await client.getAddressAsync(0),
      recipient: await client.getAddressAsync(1),
      amount: assetToBase(assetAmount(1, 8)),
      memo: 'test',
    })
    console.log(unsignedTx)
  })

  it('Should make transfer to address 0', async () => {
    const hash = await client.transfer({
      recipient: await client.getAddressAsync(0),
      amount: assetToBase(assetAmount(1, 8)),
      memo: 'test',
    })
    console.log(hash)
  })

  it('Should make deposit', async () => {
    try {
      /**
       * MAKE SURE TO TEST THIS FUNCTION WITH YOUR KUJI ADDRESS, OTHERWISE, YOU COULD LOSE FUNDS
       */
      const address: string = '' || 'TO_BE_DEFINED'
      if (address === 'TO_BE_DEFINED') throw Error('Set an address to try the deposit e2e function')
      const memo = `=:KUJI.KUJI:${address}`

      const hash = await client.deposit({
        walletIndex: 0,
        amount: assetToBase(assetAmount(1, 8)),
        asset: AssetCacao,
        memo,
      })
      console.log(hash)
    } catch (error) {
      console.log(error)
      throw error
    }
  })

  it('Should transfer offline', async () => {
    const txRaw = await client.transferOffline({
      walletIndex: 0,
      recipient: await client.getAddressAsync(0),
      amount: assetToBase(assetAmount(1, 8)),
    })
    console.log(txRaw)
  })
})
