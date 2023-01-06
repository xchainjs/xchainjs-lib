import { AssetAVAX } from '@xchainjs/xchain-avax'
import { AssetBNB } from '@xchainjs/xchain-binance'
import { Network, TxHistoryParams, TxParams } from '@xchainjs/xchain-client'
import { decryptFromKeystore, encryptToKeyStore, generatePhrase, validatePhrase } from '@xchainjs/xchain-crypto'
import { AssetETH, ETH_DECIMAL } from '@xchainjs/xchain-ethereum'
import { Client as EVMClient } from '@xchainjs/xchain-evm'
import { Client as THORClient } from '@xchainjs/xchain-thorchain'
import { ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import {
  CryptoAmount,
  EstimateSwapParams,
  Midgard,
  SaversWithdraw,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
  TxDetails,
} from '@xchainjs/xchain-thorchain-query'
import { Address, Asset, assetAmount, assetFromStringEx, assetToBase, baseToAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import fs from 'fs'

let sendingSeedPhrase = ''
let receivingSeedPhrase = ''

const sendingForReal = false

const password = 'Password123!'

// Save the encrypted Keystore using phrase generated
const generateKeystore = async (seedPhrase: string) => {
  const isCorrect = validatePhrase(seedPhrase) //validate phrase, returns Boolean
  console.log(`Phrase valid?: ${isCorrect}`)
  const keystore = await encryptToKeyStore(seedPhrase, password)
  fs.writeFileSync(`./newKeyStore.json`, JSON.stringify(keystore, null, 4), 'utf8')
  console.log(`\n ${JSON.stringify(keystore)} \n`)
}

// Connect wallet to new client
const connectKeyStoreWallet = async () => {
  const generatedKeystore = JSON.parse(fs.readFileSync('newKeyStore.json', 'utf8'))
  const phrase = await decryptFromKeystore(generatedKeystore, password)
  console.log(`\n Seed Phrase from Keystore is :\n ${phrase} \n`)
}
// Create new net seed phrase of set word length and save it to a keystore file
const createNewSeedPhrase = async () => {
  const phrase = generatePhrase(24) // creates word seed phrase, default is 12 words
  console.log(`\n New Seed Phrase is :\n ${phrase} \n`)

  const client = new THORClient({ network: Network.Testnet, phrase })
  client.setNetwork(Network.Mainnet) // Can change network of clients, Mainnet is the default

  await generateKeystore(phrase)
  await connectKeyStoreWallet()
}

function printSwapTx(txDetails: TxDetails, input: CryptoAmount) {
  const expanded = {
    memo: txDetails.memo,
    expiry: txDetails.expiry,
    toAddress: txDetails.toAddress,
    txEstimate: {
      input: input.formatedAssetString(),
      totalFees: {
        inboundFee: txDetails.txEstimate.totalFees.inboundFee.formatedAssetString(),
        swapFee: txDetails.txEstimate.totalFees.swapFee.formatedAssetString(),
        outboundFee: txDetails.txEstimate.totalFees.outboundFee.formatedAssetString(),
        affiliateFee: txDetails.txEstimate.totalFees.affiliateFee.formatedAssetString(),
      },
      slipPercentage: txDetails.txEstimate.slipPercentage.toFixed(),
      netOutput: txDetails.txEstimate.netOutput.formatedAssetString(),
      waitTimeSeconds: txDetails.txEstimate.waitTimeSeconds.toFixed(),
      canSwap: txDetails.txEstimate.canSwap,
      errors: txDetails.txEstimate.errors,
    },
  }
  console.log(expanded)
}

// Displays the transaction
const queryTransactionData = async (wallet: Wallet, asset: Asset, txId: string) => {
  try {
    console.log(`Urls for tx is: ${wallet.clients[asset.chain].getExplorerTxUrl(txId)}`)
    const txData = await wallet.clients[asset.chain].getTransactionData(txId)
    console.log(txData)
    //  console.log(`\n ${JSON.stringify(txData)}`)
  } catch (error) {
    console.error(error)
  }
}

// Displays all the address and balance for each address within the wallet
const queryWalletBalances = async (wallet: Wallet) => {
  const allWalletBalances = await wallet.getAllBalances()
  try {
    allWalletBalances.forEach((element) => {
      if (typeof element.balances === 'string') {
        console.log(`error:${element.balances}`)
      } else {
        const assetBalance = element.balances[0]
        if (assetBalance === undefined || element.balances.length == 0) {
          console.log(`Asset address has no balance \n`)
        } else {
          console.log(
            `Asset Address for ${element.chain} is: ${element.address}, Balance is: ${baseToAsset(
              assetBalance.amount,
            ).amount()}`,
          )
        }
      }
    })
  } catch (error) {
    console.error(error)
  }
}

// Displays all the address within the wallet
const queryWalletAddress = async (wallet: Wallet) => {
  const walletBalances = await wallet.getAllBalances()

  walletBalances.forEach((element) => {
    console.log(`Asset Address for ${element.chain} is: ${element.address}`)
  })
}

const queryAllFeeData = async (wallet: Wallet) => {
  try {
    for (const key in wallet.clients) {
      // Etereum and Avax will need TxParams
      console.log(`Getting Fee data for ${key} `)
      if (key == 'ETH') {
        const client = wallet.clients[key] as EVMClient
        const txparams: TxParams = {
          walletIndex: 0,
          asset: AssetETH,
          amount: assetToBase(assetAmount(0.05, ETH_DECIMAL)),
          recipient: wallet.clients['ETH'].getAddress(1),
          memo: '',
        }
        const fees = await client.estimateFeesWithGasPricesAndLimits(txparams)
        console.log(
          `Fees average : ${baseToAsset(fees.fees.average).amount()}, gas limits: ${
            fees.gasLimit
          }, gas prices average: ${baseToAsset(fees.gasPrices.average).amount()}`,
        )
      } else if (key == 'AVAX') {
        const client = wallet.clients[key] as EVMClient
        const txparams: TxParams = {
          walletIndex: 0,
          asset: client.config.gasAsset,
          amount: assetToBase(assetAmount(0.05)),
          recipient: wallet.clients['AVAX'].getAddress(1),
          memo: '',
        }
        const fees = await client.estimateFeesWithGasPricesAndLimits(txparams)
        console.log(
          `Fees average : ${baseToAsset(fees.fees.average).amount()}, gas limits: ${
            fees.gasLimit
          }, gas prices average: ${baseToAsset(fees.gasPrices.average).amount()}`,
        )
      } else {
        const fee = await wallet.clients[key].getFees()
        console.log(
          `Fees average:  ${baseToAsset(fee.average).amount()} Fees fast:  ${baseToAsset(
            fee.fast,
          ).amount()} Fees fastest:  ${baseToAsset(fee.fastest).amount()}`,
        )
      }
    }
  } catch (error) {
    console.error(error)
  }
}

//Gets all transactions for clients
const queryAllTransactionHistory = async (wallet: Wallet) => {
  const txHistoryParams: TxHistoryParams = {
    address: '', // Address to get history for
    offset: 0, // Optional Offset
    limit: 5, // Optional Limit of transactions
    // startTime?: Date // Optional start time
    // asset?: string // Optional asset. Result transactions will be filtered by this asset
  }
  try {
    for (const key in wallet.clients) {
      console.log(`Getting Transaction data for ${key} on Address: ${wallet.clients[key].getAddress()}`)
      //const txHistory = await wallet.clients[key].getTransactions({ address: wallet.clients[key].getAddress(), limit: 4 }) // fails on BTC, axios error

      txHistoryParams.address = wallet.clients[key].getAddress()
      try {
        const txHistory = await wallet.clients[key].getTransactions(txHistoryParams) //  // same error.
        console.log(`Found ${txHistory.total.toString()}`)
        txHistory.txs.forEach((tx) => console.log(tx.hash))
      } catch (error) {
        console.error(`Caught error with ${key}: ${error}`)
        continue
      }
    }
  } catch (error) {
    console.error(error)
  }
}

// send an asset from your wallet to another address
const sendCrypto = async (
  sendingWallet: Wallet,
  amountToTransfer: CryptoAmount,
  destinationAddress: Address,
): Promise<string> => {
  try {
    console.log(`Recipient address: ${destinationAddress}`)

    const toChain = amountToTransfer.asset.synth ? 'THOR' : amountToTransfer.asset.chain
    const client = sendingWallet.clients[toChain]

    console.log(
      `Sending ${amountToTransfer.assetAmount.amount().toFixed()} ${
        amountToTransfer.asset.symbol
      } to ${destinationAddress}`,
    )

    const txid = await client.transfer({
      walletIndex: 0,
      asset: amountToTransfer.asset,
      recipient: destinationAddress,
      amount: assetToBase(amountToTransfer.assetAmount),
      memo: 'xchain-transfer',
    })
    console.log(txid)
    return txid
  } catch (error) {
    console.error(error)
  }
  return ''
}
// swap any asset to any asset
const doSwap = async (
  tcAmm: ThorchainAMM,
  wallet: Wallet,
  fromAsset: CryptoAmount,
  toAsset: Asset,
  destinationAddress: Address,
) => {
  const swapParams: EstimateSwapParams = {
    input: fromAsset,
    destinationAsset: toAsset,
    destinationAddress: destinationAddress,
    interfaceID: '888',
    slipLimit: new BigNumber('0.03'), //optional
  }
  try {
    const outputCanSwap = await tcAmm.estimateSwap(swapParams)
    printSwapTx(outputCanSwap, swapParams.input)

    if (outputCanSwap.txEstimate.canSwap) {
      const output = await tcAmm.doSwap(wallet, swapParams)
      console.log(
        `Swap complete: Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${output.waitTimeSeconds}`,
      )
    }
  } catch (error) {
    console.error(error)
  }
}

const depositSaver = async (thorchainAmm: ThorchainAMM, wallet: Wallet, cryptoAmount: CryptoAmount) => {
  try {
    const depositSavers = await thorchainAmm.addSaver(wallet, cryptoAmount)
    console.log(depositSavers)
  } catch (e) {
    console.error(e)
  }
}

const withdrawSaver = async (thorchainAmm: ThorchainAMM, wallet: Wallet, withdrawPos: SaversWithdraw) => {
  try {
    const withdrawSavers = await thorchainAmm.withdrawSaver(wallet, withdrawPos)
    console.log(withdrawSavers)
  } catch (e) {
    console.error(e)
  }
}

const main = async () => {
  const thorchainQuery = new ThorchainQuery(
    new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet)),
  )

  sendingSeedPhrase = process.argv[2]
  console.log(sendingSeedPhrase)
  receivingSeedPhrase = process.argv[3]
  console.log(receivingSeedPhrase)

  const sendingWallet = new Wallet(sendingSeedPhrase!, thorchainQuery)

  await createNewSeedPhrase()
  await queryWalletAddress(sendingWallet)
  await queryWalletBalances(sendingWallet)
  await queryAllFeeData(sendingWallet)
  await queryAllTransactionHistory(sendingWallet)

  if (sendingForReal) {
    const receivingWallet = new Wallet(receivingSeedPhrase!, thorchainQuery)
    //--------------------------------Transfer BNB   -------------------
    const amountToSend = 0.005,
      assetToSend = 'BNB.BNB',
      decimalLength = 8
    const cryptoAmountToSend = new CryptoAmount(
      assetToBase(assetAmount(amountToSend, Number(decimalLength))),
      assetFromStringEx(assetToSend),
    )
    const hash = await sendCrypto(
      sendingWallet,
      cryptoAmountToSend,
      receivingWallet.clients[cryptoAmountToSend.asset.chain].getAddress(),
    )
    await new Promise((resolve) => setTimeout(resolve, 5000)) // wait for the tx to go through.
    if (hash.length != 0) {
      await queryTransactionData(sendingWallet, AssetBNB, hash)
    }
    //--------------------------------Swap BNB to AVAX ----------------------
    const fromCryptoAmount = new CryptoAmount(assetToBase(assetAmount(0.4, Number(8))), assetFromStringEx('BNB.BNB'))
    const thorchainAmm = new ThorchainAMM(thorchainQuery)
    await doSwap(
      thorchainAmm,
      sendingWallet,
      fromCryptoAmount,
      AssetAVAX,
      sendingWallet.clients[AssetAVAX.chain].getAddress(),
    )
    //--------------------------------Add to Savers ----------------------
    const saversDeposit = new CryptoAmount(assetToBase(assetAmount(0.5, Number(8))), AssetBNB)
    await depositSaver(thorchainAmm, sendingWallet, saversDeposit)
    //--------------------------------Withdrawal from Savers -----------
    const withdrawPos: SaversWithdraw = {
      address: sendingWallet.clients[saversDeposit.asset.chain].getAddress(),
      asset: saversDeposit.asset,
      withdrawBps: 100 * 100,
    }
    await withdrawSaver(thorchainAmm, sendingWallet, withdrawPos)
    //-----------------------------------------------------------------
  } else {
    console.log(`sendingForReal Flag is sent to false`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
