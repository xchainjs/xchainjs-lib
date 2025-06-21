import { Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Network } from '@xchainjs/xchain-client'
import { Client as GaiaClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as LtcClient, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import { Client as ThorClient, defaultClientConfig as defaultThorParams } from '@xchainjs/xchain-thorchain'
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { SaversWithdraw, ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { Asset, TokenAsset, assetFromString, register9Rheader } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'
import axios from 'axios'

register9Rheader(axios)

/**
 * Withdraw lp function
 * Returns tx
 */
const withdrawSavers = async (tcAmm: ThorchainAMM) => {
  try {
    const asset = assetFromString(process.argv[4]) as Asset | TokenAsset
    const address = process.argv[5] || ''
    const withdrawBps = Number(process.argv[6])

    const saversWithdraw: SaversWithdraw = {
      asset,
      address,
      withdrawBps,
    }
    const withdraw = await tcAmm.withdrawSaver(saversWithdraw)
    console.log(withdraw)
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
    THOR: new ThorClient({ ...defaultThorParams, phrase: seed, network }),
  })
  const thorchainAmm = new ThorchainAMM(new ThorchainQuery(), wallet)
  await withdrawSavers(thorchainAmm)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
