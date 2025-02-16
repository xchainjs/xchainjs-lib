import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { Client as DashClient, defaultDashParams } from '@xchainjs/xchain-dash'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as KujiraClient, defaultKujiParams } from '@xchainjs/xchain-kujira'
import { Client as MayaClient } from '@xchainjs/xchain-mayachain'
import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'
import { MayaChain, MayachainQuery, QuoteSwapParams } from '@xchainjs/xchain-mayachain-query'
import { Client as ThorClient } from '@xchainjs/xchain-thorchain'
import {
  Asset,
  CryptoAmount,
  SynthAsset,
  TokenAsset,
  assetAmount,
  assetFromString,
  assetToBase,
  assetToString,
  isSynthAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { isProtocolERC20Asset, printQuoteSwap } from './utils'

const doSwap = async (mayachainAmm: MayachainAMM, quoteSwapParams: QuoteSwapParams) => {
  try {
    const quoteSwap = await mayachainAmm.estimateSwap(quoteSwapParams)
    console.log('______________________    ESTIMATION   ____________________')
    printQuoteSwap(quoteSwap)
    if (quoteSwap.canSwap) {
      console.log('______________________      RESULT     ____________________')
      console.log(
        `Executing swap from ${assetToString(quoteSwapParams.fromAsset)} to ${assetToString(
          quoteSwapParams.destinationAsset,
        )}`,
      )
      if (isProtocolERC20Asset(quoteSwapParams.fromAsset)) {
        const txApprove = await mayachainAmm.approveRouterToSpend({
          asset: quoteSwapParams.fromAsset,
          amount: quoteSwapParams.amount,
        })
        console.log('txApprove:', txApprove)
      }
      const txSubmitted = await mayachainAmm.doSwap(quoteSwapParams)
      console.log(`Tx hash: ${txSubmitted.hash},\n Tx url: ${txSubmitted.url}\n`)
    }
  } catch (error) {
    console.error(error)
  }
}

const main = async () => {
  const seed = process.argv[2]
  const network = process.argv[3] as Network
  const amount = process.argv[4]
  const decimals = Number(process.argv[5])
  const fromAsset = assetFromString(`${process.argv[6]}`) as Asset | TokenAsset | SynthAsset
  const toAsset = assetFromString(`${process.argv[7]}`) as Asset | TokenAsset | SynthAsset
  const affiliateAddress = process.argv[8]
  let affiliateBps = 0

  if (affiliateAddress) {
    affiliateBps = Number(process.argv[9])
  }

  const wallet = new Wallet({
    BTC: new BtcClient({ ...defaultBtcParams, network, phrase: seed }),
    ETH: new EthClient({ ...defaultEthParams, network, phrase: seed }),
    DASH: new DashClient({ ...defaultDashParams, network, phrase: seed }),
    KUJI: new KujiraClient({ ...defaultKujiParams, network, phrase: seed }),
    THOR: new ThorClient({ network, phrase: seed }),
    MAYA: new MayaClient({ network, phrase: seed }),
  })
  const toChain = isSynthAsset(toAsset) ? MayaChain : toAsset.chain
  const quoteSwapParams: QuoteSwapParams = {
    fromAsset,
    destinationAsset: toAsset,
    amount: new CryptoAmount(assetToBase(assetAmount(amount, decimals)), fromAsset),
    affiliateAddress,
    affiliateBps,
    destinationAddress: await wallet.getAddress(toChain),
  }

  console.log('====================== DO SWAP EXAMPLE ====================')
  console.log('\n\n\n')
  console.log('______________________    SWAP TO DO   ____________________')
  console.log({ ...quoteSwapParams, amount: quoteSwapParams.amount.assetAmount.amount().toString() })

  const mayachainAmm = new MayachainAMM(new MayachainQuery(), wallet)
  await doSwap(mayachainAmm, quoteSwapParams)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
