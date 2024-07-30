import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { Client as DashClient, defaultDashParams } from '@xchainjs/xchain-dash'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as KujiraClient, defaultKujiParams } from '@xchainjs/xchain-kujira'
import { Client as MayaClient } from '@xchainjs/xchain-mayachain'
import { ApproveParams, MayachainAMM } from '@xchainjs/xchain-mayachain-amm'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import { Client as ThorClient } from '@xchainjs/xchain-thorchain'
import { CryptoAmount, TokenAsset, assetAmount, assetFromString, assetToBase } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

const approveRouter = async (mayachainAmm: MayachainAMM, params: ApproveParams) => {
  const txSubmitted = await mayachainAmm.approveRouterToSpend(params)
  console.log(txSubmitted)
}

const main = async () => {
  const seed = process.argv[2]
  const network = process.argv[3] as Network
  const asset = assetFromString(`${process.argv[4]}`) as TokenAsset
  const assetDecimals = Number(process.argv[5])
  const amount = process.argv[6]

  const wallet = new Wallet({
    BTC: new BtcClient({ ...defaultBtcParams, network, phrase: seed }),
    ETH: new EthClient({ ...defaultEthParams, network, phrase: seed }),
    DASH: new DashClient({ ...defaultDashParams, network, phrase: seed }),
    KUJI: new KujiraClient({ ...defaultKujiParams, network, phrase: seed }),
    THOR: new ThorClient({ network, phrase: seed }),
    MAYA: new MayaClient({ network, phrase: seed }),
  })

  const mayachainAmm = new MayachainAMM(new MayachainQuery(), wallet)

  await approveRouter(mayachainAmm, {
    asset,
    amount: new CryptoAmount(assetToBase(assetAmount(amount, assetDecimals)), asset),
  })
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
