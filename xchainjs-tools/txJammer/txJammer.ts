import fs = require('fs')

import { Network } from '@xchainjs/xchain-client'
import { decryptFromKeystore } from '@xchainjs/xchain-crypto'
import { ThorchainAMM, TxSubmitted, Wallet } from '@xchainjs/xchain-thorchain-amm'
import {
  AddliquidityPosition,
  CryptoAmount,
  EstimateSwapParams,
  Midgard,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
  //WithdrawLiquidityPosition,
} from '@xchainjs/xchain-thorchain-query'
import {
  AssetAVAX,
  AssetAtom,
  AssetBCH,
  AssetBNB,
  AssetBTC,
  AssetDOGE,
  AssetETH,
  AssetLTC,
  AssetRuneNative,
  Chain,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  delay,
} from '@xchainjs/xchain-util'

const keystore1 = JSON.parse(fs.readFileSync('keystore1.json', 'utf8'))
const keystore2 = JSON.parse(fs.readFileSync('keystore2.json', 'utf8'))
const password = process.env.PASSWORD

const USDT = assetFromStringEx(`ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7`)

// Randomise asset list pulled from stagenet pools
const assetList = [AssetAtom, AssetAVAX, AssetBCH, AssetBNB, AssetBTC, AssetDOGE, AssetETH, AssetLTC, USDT]
let txCount = 0
// const affiliateAddress = [] ** send to iether wallet's thor address
// const affiliatebasisPointsMin = 0
// const affiliatebasisPointsMax = 10000

const txRecord = []

// set min and max tx
const txMin = 1
const txMax = 5

// Allows all tx's to have enough.
const minTxAmount = new CryptoAmount(assetToBase(assetAmount(`2`, 6)), USDT)

// Types
export type TxDetail = {
  txCount: number
  hash: TxSubmitted
  memo?: string
  vault?: string
  amount: string
}

/**
 * Random number generator from 2 inputs
 * @param max
 * @param min
 * @returns random number
 */
const getRandomArbitrary = async (max: number, min: number) => {
  const randomNumber = Math.random() * (max - min) + min
  return randomNumber
}

/**
 *
 * @param tcQuery
 * @param assetAmount
 * @returns random asset with a value of $2 usdt
 */
const getRandomAssetCryptoAmount = async (tcQuery: ThorchainQuery, assetAmount: CryptoAmount) => {
  const rndAssetSelector = await getRandomArbitrary(0, assetList.length)
  const assetTo = assetList[+rndAssetSelector.toFixed()]

  const assetRandom = await tcQuery.convert(assetAmount, assetTo)
  return assetRandom
}

/**
 * Takes in the list of pool assets from above > taken from stagenet
 * @returns synth asset
 */
const getRandomSynthAsset = async () => {
  const rndAssetSelector = await getRandomArbitrary(0, assetList.length)
  const assetTo = assetList[+rndAssetSelector.toFixed()]
  try {
    const synthAsset = assetFromStringEx(`${assetTo.chain}/${assetTo.ticker}`)
    return synthAsset
  } catch (e) {
    console.log(e)
  }
}

/**
 *
 * @param amount - input amount
 * @param wallet1 - wallet from
 * @param wallet2 - wallet to
 * @param tcAmm - amm instance
 * @param tcQuery - query instance
 */
const swapToRune = async (
  amount: CryptoAmount,
  wallet1: Wallet,
  wallet2: Wallet,
  tcAmm: ThorchainAMM,
  tcQuery: ThorchainQuery,
) => {
  const swapParams: EstimateSwapParams = {
    input: amount,
    destinationAsset: AssetRuneNative,
    destinationAddress: wallet2.clients[Chain.THORChain].getAddress(),
  }
  try {
    const estimate = await tcQuery.estimateSwap(swapParams)
    if (estimate.txEstimate.canSwap) {
      const txhash = await tcAmm.doSwap(wallet1, swapParams)
      txCount += 1
      const txDetails: TxDetail = {
        txCount: txCount,
        hash: txhash,
        memo: estimate.memo,
        vault: estimate.toAddress,
        amount: estimate.txEstimate.netOutput.formatedAssetString(),
      }
      txRecord.push(txDetails)
    }
  } catch (e) {
    throw Error(`Error in swapping to rune ${e}`)
  }
}

/**
 *
 * @param amount - input amount
 * @param wallet1 - wallet from
 * @param wallet2 - wallet to
 * @param tcAmm - amm instance
 * @param tcQuery - query instance
 */
const swapToOtherRandomL1 = async (
  amount: CryptoAmount,
  wallet1: Wallet,
  wallet2: Wallet,
  tcAmm: ThorchainAMM,
  tcQuery: ThorchainQuery,
) => {
  const randomAssetAmount = await getRandomAssetCryptoAmount(tcQuery, minTxAmount)
  const destination = await getRandomAssetCryptoAmount(tcQuery, minTxAmount)
  const swapParams: EstimateSwapParams = {
    input: randomAssetAmount,
    destinationAsset: destination.asset,
    destinationAddress: wallet2.clients[destination.asset.chain].getAddress(),
  }
  try {
    const estimate = await tcQuery.estimateSwap(swapParams)
    if (estimate.txEstimate.canSwap) {
      const txhash = await tcAmm.doSwap(wallet1, swapParams)
      txCount += 1
      const txDetails: TxDetail = {
        txCount: txCount,
        hash: txhash,
        memo: estimate.memo,
        vault: estimate.toAddress,
        amount: estimate.txEstimate.netOutput.formatedAssetString(),
      }
      txRecord.push(txDetails)
    }
  } catch (e) {
    throw Error(`Error in swapping to other l1 ${e}`)
  }
}
/**
 *
 * @param amount - input amount
 * @param wallet1 - wallet from
 * @param wallet2 - wallet to
 * @param tcAmm - amm instance
 * @param tcQuery - query instance
 */
const swapToSynth = async (
  amount: CryptoAmount,
  wallet1: Wallet,
  wallet2: Wallet,
  tcAmm: ThorchainAMM,
  tcQuery: ThorchainQuery,
) => {
  const randomAssetAmount = await getRandomAssetCryptoAmount(tcQuery, minTxAmount)
  const destination = await getRandomSynthAsset()
  const swapParams: EstimateSwapParams = {
    input: randomAssetAmount,
    destinationAsset: destination,
    destinationAddress: wallet2.clients[destination.chain].getAddress(),
  }
  try {
    const estimate = await tcQuery.estimateSwap(swapParams)
    if (estimate.txEstimate.canSwap) {
      const txhash = await tcAmm.doSwap(wallet1, swapParams)
      txCount += 1
      const txDetails: TxDetail = {
        txCount: txCount,
        hash: txhash,
        memo: estimate.memo,
        vault: estimate.toAddress,
        amount: estimate.txEstimate.netOutput.formatedAssetString(),
      }
      txRecord.push(txDetails)
    }
  } catch (e) {
    throw Error(`Error in swapping to synth ${e}`)
  }
}

/**
 *
 * @param amount - input amount
 * @param wallet1 - wallet from
 * @param wallet2 - wallet to
 * @param tcAmm - amm instance
 * @param tcQuery - query instance
 */
const swapFromSynth = async (
  amount: CryptoAmount,
  wallet1: Wallet,
  wallet2: Wallet,
  tcAmm: ThorchainAMM,
  tcQuery: ThorchainQuery,
) => {
  const randomAssetAmount = await getRandomAssetCryptoAmount(tcQuery, minTxAmount)
  const destination = await getRandomSynthAsset()
  const swapParams: EstimateSwapParams = {
    input: randomAssetAmount,
    destinationAsset: destination,
    destinationAddress: wallet2.clients[destination.chain].getAddress(),
  }
  try {
    const estimate = await tcQuery.estimateSwap(swapParams)
    if (estimate.txEstimate.canSwap) {
      const txhash = await tcAmm.doSwap(wallet1, swapParams)
      txCount += 1
      const txDetails: TxDetail = {
        txCount: txCount,
        hash: txhash,
        memo: estimate.memo,
        vault: estimate.toAddress,
        amount: estimate.txEstimate.netOutput.formatedAssetString(),
      }
      txRecord.push(txDetails)
    }
  } catch (e) {
    throw Error(`Error in swapping from synth ${e}`)
  }
}

const addLiquidity = async (
  amount: CryptoAmount,
  wallet1: Wallet,
  wallet2: Wallet,
  tcAmm: ThorchainAMM,
  tcQuery: ThorchainQuery,
) => {
  const rune = await tcQuery.convert(amount, AssetRuneNative)
  const destination = await getRandomAssetCryptoAmount(tcQuery, minTxAmount)
  const inboundDetails = await tcQuery.thorchainCache.getPoolForAsset(destination.asset)
  const decimals = inboundDetails.pool.nativeDecimal
  const randomNumber = await getRandomArbitrary(1, 10)
  // if it is even its a symmetrical add if its odd the its an asymetrical add
  const isEven = randomNumber % 2 === 0
  let addlp: AddliquidityPosition
  if (isEven) {
    addlp.rune = rune
    addlp.asset = destination
  } else {
    addlp.rune = rune
    addlp.asset = new CryptoAmount(assetToBase(assetAmount(0, +decimals)), destination.asset)
  }

  try {
    const estimate = await tcQuery.estimateAddLP(addlp)
    if (estimate.canAdd) {
      const txhash = await tcAmm.addLiquidityPosition(wallet1, addlp)
      txCount += 1
      const txDetails: TxDetail = {
        txCount: txCount,
        hash: txhash[1],
        amount: `${addlp.asset.formatedAssetString()}, ${addlp.asset.formatedAssetString()}`,
      }
      txRecord.push(txDetails)
    }
  } catch (e) {
    throw Error(`Error in swapping from synth ${e}`)
  }
}
// const withdrawLp = async (
//   amount: CryptoAmount,
//   wallet1: Wallet,
//   wallet2: Wallet,
//   tcAmm: ThorchainAMM,
//   tcQuery: ThorchainQuery,
// ) => {
//   //const runeAddress = await wallet1.clients[Chain.THORChain].getAddress()
//   // const checkLp = await tcQuery.checkLiquidityPosition( assetList[], runeAddress) return lp
//   // const withdrawLParams: WithdrawLiquidityPosition = {
//   //   asset:
//   // }
//   // try {
//   //   const estimate = await tcQuery.estimateWithdrawLP(withdrawLParams)
//   //   if (estimate) {
//   //     const txhash = await tcAmm.withdrawLiquidityPosition(wallet1, withdrawLParams)
//   //     txCount += 1
//   //     const txDetails: TxDetail = {
//   //       txCount: txCount,
//   //       hash: txhash[1],
//   //       amount: `${estimate.assetAmount.formatedAssetString()}, ${estimate.runeAmount.formatedAssetString()}`,
//   //     }
//   //     txRecord.push(txDetails)
//   //   }
//   // } catch (e) {
//   //   throw Error(`Error in swapping from synth ${e}`)
//   // }
// }

// const dexAggSwapIn = async () => {}
// const dexAggSwapOut = async () => {}
// const addSavers = async () => {}
// const withdrawSavers = async () => {}

// Rebalance wallets to be of equal value..
// const reBalanceWallets = async (tcAmm: ThorchainAMM, tcQuery: ThorchainQuery, wallet1: Wallet, wallet2: Wallet) => {
//   const
// }

// /**
//  * tx : {hash: hash,
//  * memo: memo,
//  * vault: vault,
//  * amount: amount,}
//  * @param txDetails - details to write to the file
//  */
// const writeToFile = async (txDetails: TxDetails) => {
//   fs.writeFileSync(`./txJammer${Date}.json`, JSON.stringify(txDetails, null, 4), 'utf8')
// }

/**
 *
 * @param tcAmm - AMM instance
 * @param tcQuery - Query instance
 * @param wallet1 - wallet 1
 * @param wallet2 - wallet 2
 */
const startTxJammer = async (tcAmm: ThorchainAMM, tcQuery: ThorchainQuery, wallet1: Wallet, wallet2: Wallet) => {
  const txRandomCeiling = await getRandomArbitrary(txMax, txMin)
  console.log(`TX Jammer Time`)
  // run while transactions are less than max transactions
  while (txCount < txRandomCeiling) {
    // convert 2 usdt to random asset.
    const amount = await getRandomAssetCryptoAmount(tcQuery, minTxAmount)
    await swapToRune(amount, wallet1, wallet2, tcAmm, tcQuery)
    // delay program by 2 seconds
    await delay(2000)
    await swapToOtherRandomL1(amount, wallet1, wallet2, tcAmm, tcQuery)
    // delay program by 2 seconds
    await delay(2000)
    await swapToSynth(amount, wallet1, wallet2, tcAmm, tcQuery)
    // delay program by 2 seconds
    await delay(2000)
    await swapFromSynth(amount, wallet1, wallet2, tcAmm, tcQuery)
    // delay program by 2 seconds
    await delay(2000)
    await addLiquidity(amount, wallet1, wallet2, tcAmm, tcQuery)
    // delay program by 2 seconds
    await delay(2000)
    //await withdrawLp(amount, wallet1, wallet2, tcAmm, tcQuery)
    console.log(txRecord)
  }
}

/**
 * ToDo Make wallet random. or self balancing, so it doesn't matter which wallet makes the transaction
 */
const main = async () => {
  const phrase1 = await decryptFromKeystore(keystore1, password)
  const phrase2 = await decryptFromKeystore(keystore2, password)
  const thorchainCache = new ThorchainCache(new Midgard(Network.Stagenet), new Thornode(Network.Stagenet))
  const thorchainQuery = new ThorchainQuery(thorchainCache)
  const thorchainAmm = new ThorchainAMM(thorchainQuery)
  const wallet1 = new Wallet(phrase1, thorchainQuery)
  const wallet2 = new Wallet(phrase2, thorchainQuery)
  await startTxJammer(thorchainAmm, thorchainQuery, wallet1, wallet2)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
