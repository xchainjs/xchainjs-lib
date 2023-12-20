import { Network } from '@xchainjs/xchain-client'
import { decryptFromKeystore } from "@xchainjs/xchain-crypto"
import { readFileSync } from 'fs';
import { MayachainAMM, Wallet } from '@xchainjs/xchain-mayachain-amm'
import { MayaChain, MayachainQuery, QuoteSwap, QuoteSwapParams } from '@xchainjs/xchain-mayachain-query'
import { CryptoAmount, assetAmount, assetFromString, assetToBase, assetToString } from '@xchainjs/xchain-util'

const printQuoteSwap = (quoteSwap: QuoteSwap) => {
  console.log({
    toAddress: quoteSwap.toAddress,
    memo: quoteSwap.memo,
    expectedAmount: {
      asset: assetToString(quoteSwap.expectedAmount.asset),
      amount: quoteSwap.expectedAmount.baseAmount.amount().toString(),
      decimals: quoteSwap.expectedAmount.baseAmount.decimal,
    },
    dustThreshold: {
      asset: assetToString(quoteSwap.dustThreshold.asset),
      amount: quoteSwap.dustThreshold.baseAmount.amount().toString(),
      decimals: quoteSwap.dustThreshold.baseAmount.decimal,
    },
    totalFees: {
      asset: assetToString(quoteSwap.fees.asset),
      outboundFee: {
        asset: assetToString(quoteSwap.fees.outboundFee.asset),
        amount: quoteSwap.fees.outboundFee.baseAmount.amount().toString(),
        decimals: quoteSwap.fees.outboundFee.baseAmount.decimal,
      },
    },
    inboundConfirmationSeconds: quoteSwap.inboundConfirmationSeconds,
    inboundConfirmationBlocks: quoteSwap.inboundConfirmationBlocks,
    outboundDelaySeconds: quoteSwap.outboundDelaySeconds,
    outboundDelayBlocks: quoteSwap.outboundDelayBlocks,
    totalSwapSeconds: quoteSwap.totalSwapSeconds,
    slipBasisPoints: quoteSwap.slipBasisPoints,
    canSwap: quoteSwap.canSwap,
    errors: quoteSwap.errors,
    warning: quoteSwap.warning,
  })
}

const doSwap = async (mayachainAmm: MayachainAMM, quoteSwapParams: QuoteSwapParams) => {
  try {
    const quoteSwap = await mayachainAmm.estimateSwap(quoteSwapParams)
    printQuoteSwap(quoteSwap)
    if (quoteSwap.canSwap) {
      const txSubmitted = await mayachainAmm.doSwap(quoteSwapParams)
      console.log(`Tx hash: ${txSubmitted.hash},\n Tx url: ${txSubmitted.url}\n`)
    }
  } catch (error) {
    console.error(error)
  }
}

const main = async () => {
  const pass = process.argv[2]
  const keyStore = JSON.parse(readFileSync(process.argv[8], 'utf8'))
  const seed = await decryptFromKeystore(keyStore, pass)
  const network = process.argv[3] as Network
  const amount = process.argv[4]
  const decimals = Number(process.argv[5])
  const fromAsset = assetFromString(`${process.argv[6]}`)
  const toAsset = assetFromString(`${process.argv[7]}`)

  const wallet = new Wallet(seed, network)
  const toChain = toAsset.synth ? MayaChain : toAsset.chain
  const quoteSwapParams: QuoteSwapParams = {
    fromAsset,
    destinationAsset: toAsset,
    amount: new CryptoAmount(assetToBase(assetAmount(amount, decimals)), fromAsset),
    destinationAddress: await wallet.getAddress(toChain),
  }


  const mayachainAmm = new MayachainAMM(new MayachainQuery(), wallet)
  await doSwap(mayachainAmm, quoteSwapParams)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
