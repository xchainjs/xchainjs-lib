import { Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Client as GaiaClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as LtcClient, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import { Client as ThorClient, defaultClientConfig as defaultThorParams } from '@xchainjs/xchain-thorchain'
import { ThorchainAMM, WithdrawFromTradeAccountParams } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { TradeCryptoAmount, assetAmount, assetFromStringEx, assetToBase, isTradeAsset } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

const withdrawFromTradeAssetAccount = async (
  thorchainAMM: ThorchainAMM,
  withdrawFromTradeAccountParams: WithdrawFromTradeAccountParams,
) => {
  const txSubmitted = await thorchainAMM.withdrawFromTradeAccount(withdrawFromTradeAccountParams)
  console.log(txSubmitted)
}

const main = async () => {
  const seed = process.argv[2]
  const amount = process.argv[3]
  const asset = assetFromStringEx(`${process.argv[4]}`)

  if (!isTradeAsset(asset)) {
    throw Error('Can not withdraw non Trade asset')
  }

  const wallet = new Wallet({
    BTC: new BtcClient({ ...defaultBtcParams, phrase: seed }),
    BCH: new BchClient({ ...defaultBchParams, phrase: seed }),
    LTC: new LtcClient({ ...defaultLtcParams, phrase: seed }),
    DOGE: new DogeClient({ ...defaultDogeParams, phrase: seed }),
    ETH: new EthClient({ ...defaultEthParams, phrase: seed }),
    AVAX: new AvaxClient({ ...defaultAvaxParams, phrase: seed }),
    BSC: new BscClient({ ...defaultBscParams, phrase: seed }),
    GAIA: new GaiaClient({ phrase: seed }),
    THOR: new ThorClient({ ...defaultThorParams, phrase: seed }),
  })

  const thorchainAMM = new ThorchainAMM(new ThorchainQuery(), wallet)

  const withdrawFromTradeAccountParams: WithdrawFromTradeAccountParams = {
    amount: new TradeCryptoAmount(assetToBase(assetAmount(amount, 8)), asset),
    address: await wallet.getAddress(asset.chain),
  }

  await withdrawFromTradeAssetAccount(thorchainAMM, withdrawFromTradeAccountParams)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
