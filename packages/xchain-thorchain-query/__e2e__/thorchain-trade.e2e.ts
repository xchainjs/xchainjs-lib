import { TradeAsset, assetFromStringEx, assetToString } from '@xchainjs/xchain-util'

import { ThorchainQuery } from '../src'

describe('Thorchain Query', () => {
  let thorchainQuery: ThorchainQuery

  beforeAll(() => {
    thorchainQuery = new ThorchainQuery()
  })

  it('Should get trade asset unit', async () => {
    const asset = assetFromStringEx('ETH~ETH') as TradeAsset
    const tradeAssetUnits = await thorchainQuery.getTradeAssetUnits({ asset })
    console.log({
      tradeAsset: assetToString(tradeAssetUnits.asset),
      units: {
        units: tradeAssetUnits.units.assetAmount.amount().toString(),
        asset: assetToString(tradeAssetUnits.units.asset),
      },
      depth: {
        depth: tradeAssetUnits.depth.assetAmount.amount().toString(),
        asset: assetToString(tradeAssetUnits.depth.asset),
      },
    })
  })

  it('Should get trade assets unit', async () => {
    const tradeAssetsUnits = await thorchainQuery.getTradeAssetsUnits()
    console.log(
      tradeAssetsUnits.map((tradeAssetUnits) => {
        return {
          tradeAsset: assetToString(tradeAssetUnits.asset),
          units: {
            units: tradeAssetUnits.units.assetAmount.amount().toString(),
            asset: assetToString(tradeAssetUnits.units.asset),
          },
          depth: {
            depth: tradeAssetUnits.depth.assetAmount.amount().toString(),
            asset: assetToString(tradeAssetUnits.depth.asset),
          },
        }
      }),
    )
  })

  it('Should get address trade accounts', async () => {
    const accounts = await thorchainQuery.getAddressTradeAccounts({
      address: 'thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55',
    })
    console.log(
      accounts.map((account) => {
        return {
          tradeAsset: assetToString(account.asset),
          address: account.address,
          balance: {
            amount: account.balance.assetAmount.amount().toString(),
            asset: assetToString(account.balance.asset),
          },
          lastAddHeight: account.lastAddHeight,
          lastWithdrawHeight: account.lastWithdrawHeight,
        }
      }),
    )
  })

  it('Should get trade asset accounts', async () => {
    const accounts = await thorchainQuery.getTradeAssetAccounts({
      asset: assetFromStringEx('ETH~ETH') as TradeAsset,
    })
    console.log(
      accounts.map((account) => {
        return {
          tradeAsset: assetToString(account.asset),
          address: account.address,
          balance: {
            amount: account.balance.assetAmount.amount().toString(),
            asset: assetToString(account.balance.asset),
          },
          lastAddHeight: account.lastAddHeight,
          lastWithdrawHeight: account.lastWithdrawHeight,
        }
      }),
    )
  })
})
