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
import { Client as ThorClient, THORChain, defaultClientConfig as defaultThorParams } from '@xchainjs/xchain-thorchain'
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { QuoteSwapParams, ThorchainQuery, TxDetails } from '@xchainjs/xchain-thorchain-query'
import {
  CryptoAmount,
  assetAmount,
  assetFromString,
  assetToBase,
  assetToString,
  delay,
  isSynthAsset,
  isTradeAsset,
  register9Rheader,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'
import axios from 'axios'

import { checkTx } from '../check-tx/check-tx'

register9Rheader(axios)
register9Rheader(cosmosclient.config.globalAxios)

function printTx(txDetails: TxDetails, input: CryptoAmount) {
  const expanded = {
    memo: txDetails.memo,
    expiry: txDetails.expiry,
    toAddress: txDetails.toAddress,
    txEstimate: {
      input: input.formatedAssetString(),
      totalFees: {
        asset: assetToString(txDetails.txEstimate.totalFees.asset),
        outboundFee: txDetails.txEstimate.totalFees.outboundFee.formatedAssetString(),
        affiliateFee: txDetails.txEstimate.totalFees.affiliateFee.formatedAssetString(),
      },
      slipBasisPoints: txDetails.txEstimate.slipBasisPoints.toFixed(),
      netOutput: txDetails.txEstimate.netOutput.formatedAssetString(),
      outboundDelaySeconds: txDetails.txEstimate.outboundDelaySeconds,
      canSwap: txDetails.txEstimate.canSwap,
      errors: txDetails.txEstimate.errors,
    },
  }
  console.log(expanded)
}

const delayedLog = async (message: string, delayMs: number) => {
  const startTime = new Date().getTime()
  const endTime = startTime + delayMs
  let remainingTime = delayMs

  while (remainingTime > 0) {
    const elapsedMs = delayMs - remainingTime
    const remainingSeconds = Math.ceil(remainingTime / 1000)
    const elapsedSeconds = Math.floor(elapsedMs / 1000)
    const progress = Math.floor((elapsedMs / delayMs) * 100)

    console.log(`${message} (${elapsedSeconds}s/${remainingSeconds}s ${progress}%)`)

    await delay(500)
    remainingTime = endTime - new Date().getTime()
  }

  console.log(`${message} (Done!)`)
}

/**
 * From asset to asset with no Affiliate address on testnet
 */
const doSingleSwap = async (tcAmm: ThorchainAMM, wallet: Wallet) => {
  try {
    const amount = process.argv[4]
    const decimals = Number(process.argv[5])
    const fromAsset = assetFromString(`${process.argv[6]}`)
    const toAsset = assetFromString(`${process.argv[7]}`)

    const toChain = isSynthAsset(toAsset) || isTradeAsset(toAsset) ? THORChain : toAsset.chain

    const swapParams: QuoteSwapParams = {
      fromAsset,
      amount: new CryptoAmount(assetToBase(assetAmount(amount, decimals)), fromAsset),
      destinationAsset: toAsset,
      destinationAddress: await wallet.getAddress(toChain),
      toleranceBps: 1000, //optional
    }

    const affiliateAddress = process.argv[8]
    if (affiliateAddress) {
      const affiliateFeeBasisPoints = Number(process.argv[9])
      swapParams.affiliateAddress = affiliateAddress
      swapParams.affiliateBps = affiliateFeeBasisPoints
    }
    const outPutCanSwap = await tcAmm.estimateSwap(swapParams)
    printTx(outPutCanSwap, swapParams.amount)
    if (outPutCanSwap.txEstimate.canSwap) {
      const output = await tcAmm.doSwap(swapParams)
      console.log(
        `Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${outPutCanSwap.txEstimate.outboundDelaySeconds}`,
      )
      console.log('Waiting for transaction to be confirmed...')
      await delayedLog(
        'hash',
        outPutCanSwap.txEstimate.outboundDelaySeconds <= 6
          ? 12000
          : outPutCanSwap.txEstimate.outboundDelaySeconds * 1000,
      )
      await checkTx(wallet.getNetwork(), output.hash)
    }
  } catch (error) {
    console.error(error)
  }
}

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
  await doSingleSwap(thorchainAmm, wallet)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
