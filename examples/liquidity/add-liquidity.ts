import cosmosclient from '@cosmos-client/core'
import { Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Network } from '@xchainjs/xchain-client'
import { Client as GaiaClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as LtcClient, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import {
  Client as ThorClient,
  defaultClientConfig as defaultThorParams,
  isAssetRuneNative,
} from '@xchainjs/xchain-thorchain'
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { AddliquidityPosition, ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { CryptoAmount, assetAmount, assetFromStringEx, assetToBase, register9Rheader } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'
import axios from 'axios'

register9Rheader(cosmosclient.config.globalAxios)
register9Rheader(axios)

/**
 * Add LP
 * Returns tx
 */
const addLp = async (tcAmm: ThorchainAMM) => {
  try {
    const rune = new CryptoAmount(assetToBase(assetAmount(process.argv[4])), assetFromStringEx(process.argv[5]))
    if (!isAssetRuneNative(rune.asset)) {
      throw Error('THOR.RUNE  must be the first argument')
    }
    const asset = new CryptoAmount(
      assetToBase(assetAmount(process.argv[6], Number(process.argv[7]))),
      assetFromStringEx(process.argv[8]),
    )

    const addLpParams: AddliquidityPosition = {
      asset,
      rune,
    }
    const addlptx = await tcAmm.addLiquidityPosition(addLpParams)
    console.log(addlptx)
  } catch (e) {
    console.error(e)
  }
}

// Call the function from main()
const main = async () => {
  const seed = process.argv[2]
  const network = process.argv[3] as Network
  const wallet = new Wallet({
    BTC: new BtcClient({ ...defaultBtcParams, phrase: seed, network }),
    BCH: new BchClient({ ...defaultBchParams, phrase: seed, network }),
    LTC: new LtcClient({ ...defaultLtcParams, phrase: seed, network }),
    DOGE: new DogeClient({ ...defaultDogeParams, phrase: seed, network }),
    ETH: new EthClient({ ...defaultEthParams, phrase: seed, network }),
    AVAX: new AvaxClient({ ...defaultAvaxParams, phrase: seed, network }),
    BSC: new BscClient({ ...defaultBscParams, phrase: seed, network }),
    GAIA: new GaiaClient({ phrase: seed, network }),
    BNB: new BnbClient({ phrase: seed, network }),
    THOR: new ThorClient({ ...defaultThorParams, phrase: seed, network }),
  })
  const thorchainAmm = new ThorchainAMM(new ThorchainQuery(), wallet)

  await addLp(thorchainAmm)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
