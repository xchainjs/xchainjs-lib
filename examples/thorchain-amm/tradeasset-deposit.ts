import { Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Client as GaiaClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as LtcClient, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import { Client as ThorClient, THORChain, defaultClientConfig as defaultThorParams } from '@xchainjs/xchain-thorchain'
import { AddToTradeAccountParams, ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import {
  Asset,
  CryptoAmount,
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  isSynthAsset,
  isTradeAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

const depositToTradeAssetAccount = async (
  thorchainAMM: ThorchainAMM,
  addToTradeAccountParams: AddToTradeAccountParams,
) => {
  const txSubmitted = await thorchainAMM.addToTradeAccount(addToTradeAccountParams)
  console.log(txSubmitted)
}

const main = async () => {
  const seed = process.argv[2]
  const amount = process.argv[3]
  const decimals = Number(process.argv[4])
  const asset = assetFromStringEx(`${process.argv[5]}`)

  if (isSynthAsset(asset) || isTradeAsset(asset)) {
    throw Error('Can not deposit Synth or Trade asset')
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

  const addToTradeAccountParams: AddToTradeAccountParams = {
    amount: new CryptoAmount<Asset | TokenAsset>(
      assetToBase(assetAmount(amount, decimals)),
      asset as Asset | TokenAsset,
    ),
    address: await wallet.getAddress(THORChain),
  }

  await depositToTradeAssetAccount(thorchainAMM, addToTradeAccountParams)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
