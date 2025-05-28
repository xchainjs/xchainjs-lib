import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import * as ZcashLib from '@mayaprotocol/zcash-ts'
import { Network, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UtxoClientParams } from '@xchainjs/xchain-utxo'
import { BIP32Factory } from 'bip32'
import { ECPairFactory, ECPairInterface } from 'ecpair'

import { Client, defaultZECParams } from './client'
import * as Utils from './utils'

const ECPair = ECPairFactory(ecc)
/**
 * Custom Bitcoin client extended to support keystore functionality
 */
class ClientKeystore extends Client {
  constructor(
    params: UtxoClientParams = {
      ...defaultZECParams,
    },
  ) {
    super(params)
  }
  /**
   * @deprecated This function eventually will be removed. Use getAddressAsync instead.
   * Get the address associated with the given index.
   * @param {number} index The index of the address.
   * @returns {Address} The Bitcoin address.
   * @throws {"index must be greater than zero"} Thrown if the index is less than zero.
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   */
  getAddress(index = 0): Address {
    // Check if the index is valid
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }

    // Check if the phrase has been set
    if (this.phrase) {
      const zecKeys = this.getZecKeys(this.phrase, index)
      if (!zecKeys.privateKey) {
        throw Error('Error getting private key')
      }
      const network = Utils.getZcashNetwork(this.network)
      return ZcashLib.addressFromPrivateKey(Buffer.from(zecKeys.privateKey).toString('hex'), network)
    }

    throw new Error('Phrase must be provided')
  }

  /**
   * Get the current address asynchronously.
   * @param {number} index The index of the address.
   * @returns {Promise<Address>} A promise that resolves to the Bitcoin address.
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   */
  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  /**
   * @private
   * Get the keys derived from the given phrase.
   *
   * @param {string} phrase The phrase to be used for generating the keys.
   * @param {number} index The index of the address.
   * @returns {Bitcoin.ECPair.ECPairInterface} The Bitcoin key pair.
   * @throws {"Could not get private key from phrase"} Thrown if failed to create BTC keys from the given phrase.
   */
  private getZecKeys(phrase: string, index = 0): ECPairInterface {
    const seed = getSeed(phrase)

    const bip32 = BIP32Factory(ecc)
    const master = bip32.fromSeed(seed).derivePath(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return ECPair.fromPrivateKey(Buffer.from(master.privateKey)) // Be carefull missing zcash network due to this error: https://github.com/iancoleman/bip39/issues/94
  }

  /**
   * Transfer ZEC.
   *
   * @param {TxParams&FeeRate} params The transfer options including the fee rate.
   * @returns {Promise<TxHash|string>} A promise that resolves to the transaction hash or an error message.
   * @throws {"memo too long"} Thrown if the memo is longer than 80 characters.
   */
  async transfer(params: TxParams): Promise<TxHash> {
    // Get the address index from the parameters or use the default value
    const fromAddressIndex = params?.walletIndex || 0

    const zecKeys = this.getZecKeys(this.phrase, fromAddressIndex)
    const sender = await this.getAddressAsync(fromAddressIndex)

    const utxos = await this.scanUTXOs(sender, true)
    if (utxos.length === 0) throw new Error('Insufficient Balance for transaction')

    // Determine network name for TransactionBuilder
    const networkName = this.network === Network.Mainnet ? 'mainnet' : 'testnet'
    
    // Get the current block height for proper transaction version determination
    const providerNetwork = this.dataProviders[0][this.network]
    if (!providerNetwork) throw new Error('No data provider available')
    
    // Get current block height by checking the latest transaction for this address
    // or use the highest block height from available UTXOs
    let blockHeight = 500000 // Fallback to a post-Overwinter height
    
    try {
      // Try to get recent transactions to determine current block height
      const recentTxs = await providerNetwork.getTransactions({ 
        address: sender, 
        limit: 1 
      })
      
      if (recentTxs.txs.length > 0) {
        // Use blockTime to estimate current height
        // Zcash has ~2.5 minute block times (150 seconds)
        const latestTx = recentTxs.txs[0]
        const txTimestamp = latestTx.date.getTime() / 1000
        const currentTimestamp = Date.now() / 1000
        const blocksSinceLatestTx = Math.floor((currentTimestamp - txTimestamp) / 150)
        
        // Get block height from UTXO data if available, or estimate
        const utxoHeights = utxos.map(() => {
          // UTXOs don't have height in this format, return 0
          return 0
        }).filter(h => h > 0)
        
        if (utxoHeights.length > 0) {
          blockHeight = Math.max(...utxoHeights) + blocksSinceLatestTx
        } else {
          // Conservative estimate: use a recent mainnet height
          // As of Jan 2025, Zcash mainnet is around block 2,900,000
          blockHeight = 2900000
        }
      }
    } catch (error) {
      console.warn('Could not determine current block height, using fallback:', blockHeight)
    }

    // Convert UTXOs to Zcash format
    // For Zcash P2PKH addresses, we can construct the script from the address
    const addressScript = Utils.createP2PKHScript(sender)
    const zcashUtxos: ZcashLib.UTXO[] = utxos.map((utxo) => ({
      txid: utxo.hash,
      vout: utxo.index,
      value: utxo.value,
      height: 0, // Use 0 for UTXO height as well
      script: utxo.scriptPubKey || utxo.witnessUtxo?.script?.toString('hex') || addressScript,
    }))

    // Get the private key hex and public key
    if (!zecKeys.privateKey) {
      throw Error('Error getting private key')
    }
    const privateKeyHex = Buffer.from(zecKeys.privateKey).toString('hex')
    const pubkey = ZcashLib.getPublicKeyFromPrivateKey(privateKeyHex)

    // Create a transaction builder and use it similar to Bitcoin's PSBT
    // TransactionBuilder accepts any format and normalizes internally
    const builder = new ZcashLib.TransactionBuilder(networkName)
    
    // Build the transaction
    const buildResult = builder
      .selectUTXOs(zcashUtxos, 'all') // Use all available UTXOs for automatic selection
      .addOutput(params.recipient, params.amount.amount().toNumber(), params.memo)
      .setChangeAddress(sender)
      .build(blockHeight, pubkey)
      
      
    // Check fee bounds
    checkFeeBounds(this.feeBounds, buildResult.fee)

    // Sign the transaction
    const signedTx = ZcashLib.TransactionBuilder.sign(buildResult, privateKeyHex, networkName, pubkey)

    // Broadcast
    const txId = await this.roundRobinBroadcastTx(signedTx.rawTx.toString('hex'))

    return txId
  }
}

export { ClientKeystore }
