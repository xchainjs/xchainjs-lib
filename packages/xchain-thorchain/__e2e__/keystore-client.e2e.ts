import { Tx } from '@xchainjs/xchain-client'
import {
  AssetType,
  SecuredAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseToAsset,
} from '@xchainjs/xchain-util'

import { AssetRuneNative as AssetRune, Client, DepositTx } from '../src'

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
const BTCSECURED: SecuredAsset = {
  chain: 'BTC',
  ticker: 'BTC',
  symbol: 'BTC',
  type: AssetType.SECURED,
}

describe('Thorchain Keystore', () => {
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

  it('Should get wallet address', async () => {
    const address = await client.getAddressAsync()
    console.log(address)
  })
  it('Should get wallet address Account', async () => {
    const acc = await client.getAccountDetails()
    console.log(acc)
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
    const tx = await client.getTransactionData('B949762DE7679D2C2343B135FF11EBF059DBB5DCEB1045F1D9D3DED5EB648C4C')
    console.log(getPrintableTx(tx))
  })

  it('Should get deposit transaction', async () => {
    const tx = await client.getDepositTransaction('3F763B3F874DC5EEEA965D570A0C8DCA68915669D38A486A826B2238447E5498')
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
       * MAKE SURE TO TEST THIS FUNCTION WITH YOUR ADDRESS BNB, OTHERWISE, YOU COULD LOSE FUNDS
       */
      const address: string = '' || 'TO_BE_DEFINED'
      if (address === 'TO_BE_DEFINED') throw Error('Set an address to try the deposit e2e function')
      const memo = `=:BNB.BNB:${address}`

      const hash = await client.deposit({
        walletIndex: 0,
        amount: assetToBase(assetAmount(1, 8)),
        asset: AssetRune,
        memo,
      })
      console.log(hash)
    } catch (error) {
      console.log(error)
      throw error
    }
  })

  it('Should make secured Asset swap', async () => {
    try {
      /**
       * MAKE SURE TO TEST THIS FUNCTION WITH YOUR ADDRESS BNB, OTHERWISE, YOU COULD LOSE FUNDS
       */
      const address: string = 'thor1rkpukrhljr72sxww2t0nwvng84zegp59805e03' || 'TO_BE_DEFINED'
      if (address === 'TO_BE_DEFINED') throw Error('Set an address to try the deposit e2e function')
      const memo = `=:AVAX-AVAX:${address}`

      const hash = await client.deposit({
        walletIndex: 0,
        amount: assetToBase(assetAmount(0.00024005, 8)),
        asset: BTCSECURED,
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

  it('Should make transaction with synth asset', async () => {
    const hash = await client.transfer({
      recipient: await client.getAddressAsync(0),
      amount: assetToBase(assetAmount(0.05, 8)),
      asset: assetFromStringEx('AVAX/AVAX'),
    })
    console.log({ hash })
  })
})
