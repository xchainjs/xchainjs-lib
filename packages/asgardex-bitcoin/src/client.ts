import * as Bitcoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib
import * as WIF from 'wif' // https://github.com/bitcoinjs/wif
import * as Utils from './utils'
import * as blockChair from './blockchair-api'
import { Address, AsgardexClient, TxParams, Balance, Network, Path, Fees } from '@asgardex-clients/asgardex-client'
import * as asgardexCrypto from '@thorchain/asgardex-crypto'

// https://blockchair.com/api/docs#link_300
// const baseUrl = 'https://api.blockchair.com/bitcoin/'
// const pathAddress = 'dashboards/address/'
// const pathTx = 'raw/transaction/'

/**
 * BitcoinClient Interface
 */
interface BitcoinClient {
  purgeClient(): void

  getAddress(): string

  validateAddress(address: string): boolean

  scanUTXOs(): Promise<void>
}

/**
 * Implements Client declared above
 */
class Client implements BitcoinClient, AsgardexClient {
  net: Network
  phrase = ''
  utxos: Utils.UTXO[]
  nodeUrl = ''
  nodeApiKey = ''

  // Client is initialised with network type
  constructor(_net: Network = Network.TEST, _nodeUrl = '', _nodeApiKey = '', _phrase?: string) {
    this.net = _net
    _nodeUrl && this.setNodeURL(_nodeUrl)
    _nodeApiKey && this.setNodeAPIKey(_nodeApiKey)
    _phrase && this.setPhrase(_phrase)
    this.utxos = []
  }

  setNodeURL(url: string): void {
    this.nodeUrl = url
  }

  setNodeAPIKey(key: string): void {
    this.nodeApiKey = key
  }

  generatePhrase = (): string => {
    return asgardexCrypto.generatePhrase()
  }

  // Sets this.phrase to be accessed later
  setPhrase = (phrase: string): Address => {
    if (asgardexCrypto.validatePhrase(phrase)) {
      this.phrase = phrase
      return phrase
    } else {
      throw new Error('Invalid BIP39 phrase')
    }
  }

  purgeClient = (): void => {
    this.phrase = ''
    this.utxos = []
  }

  // update network
  setNetwork(_net: Network): void {
    this.net = _net
  }

  // Will return the desired network
  getNetwork(): Network {
    return this.net === Network.TEST ? Network.TEST : Network.MAIN
  }

  getExplorerUrl(type: Path, param: string): string {
    const networkPath = this.net === Network.TEST ? '/testnet' : ''
    return type === Path.tx
      ? `https://blockstream.info${networkPath}/tx/${param}`
      : `https://blockstream.info${networkPath}/address/${param}`
  }

  // Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
  // The address is then decoded into type P2WPKH and returned.
  getAddress = (): string => {
    if (this.phrase) {
      const network = this.getNetwork()
      const btcNetwork = network === Network.TEST ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
      const btcKeys = this.getBtcKeys(this.phrase)
      const { address } = Bitcoin.payments.p2wpkh({
        pubkey: btcKeys.publicKey,
        network: btcNetwork,
      })
      if (!address) {
        throw new Error('address not defined')
      }
      return address
    }
    throw new Error('Phrase not set')
  }

  // Private function to get keyPair from the this.phrase
  private getBtcKeys(_phrase: string): Bitcoin.ECPairInterface {
    const network = this.getNetwork() == Network.TEST ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    // const buffer = BIP39.mnemonicToSeedSync(_phrase)
    // const wif = WIF.encode(network.wif, buffer, true)
    const seed = asgardexCrypto.getSeed(_phrase)
    const wif = WIF.encode(network.wif, Buffer.from(seed, 'hex'), true)
    return Bitcoin.ECPair.fromWIF(wif, network)
  }

  // Will return true/false
  validateAddress = (address: string): boolean => {
    const network = this.getNetwork() == Network.TEST ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    try {
      Bitcoin.address.toOutputScript(address, network)
      return true
    } catch (error) {
      return false
    }
  }

  // Scans UTXOs on Address
  scanUTXOs = async (): Promise<void> => {
    try {
      const address = this.getAddress()
      const dashboardsAddress = await blockChair.getAddress(this.nodeUrl, address, this.nodeApiKey)

      this.utxos = [] // clear existing utxos
      const utxos = dashboardsAddress[address].utxo

      for (let i = 0; i < utxos.length; i++) {
        const txHash = utxos[i].transaction_hash
        const value = utxos[i].value
        const index = utxos[i].index
        const txData = await blockChair.getRawTx(this.nodeUrl, txHash, this.nodeApiKey)
        const script = txData[txHash].decoded_raw_transaction.vout[index].scriptPubKey.hex
        // TODO: check scriptpubkey_type is op_return

        const witness = {
          value: value,
          script: Buffer.from(script, 'hex'),
        }

        const utxoObject = {
          hash: txHash,
          index: index,
          witnessUtxo: witness,
        }
        this.utxos.push(utxoObject)
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  // Returns balance of address
  getBalance = async (address?: string): Promise<Balance[]> => {
    if (!address) {
      address = this.getAddress()
    }

    try {
      // const chain = this.net === Network.TEST ? 'bitcoin/testnet' : 'bitcoin'
      const dashboardAddress = await blockChair.getAddress(this.nodeUrl, address, this.nodeApiKey)
      return [
        {
          coin: 'BTC.BTC',
          amount: dashboardAddress[address].address.balance,
        },
      ]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // Given a desired output, return change
  private getChange = async (valueOut: number): Promise<number> => {
    const balances = await this.getBalance()
    const btcBalance = balances.find((balance) => balance.coin === 'BTC.BTC')
    let change = 0
    if (btcBalance && btcBalance.amount > 0) {
      if (btcBalance.amount - valueOut > Utils.dustThreshold) {
        change = btcBalance.amount - valueOut
      }
    }
    return change
  }

  /**
   * TODO: Add this in with correct response type
   * Requires querying tx data for each address tx
   * @param memo
   */
  // getTransactions = async (address: string): Promise<TxPage[]> => {
  //   let transactions = []

  //   try {
  //     const chain = this.net === Network.TEST ? 'bitcoin/testnet' : 'bitcoin'
  //     const dashboardAddress = await blockChair.getAddress(chain, address)
  //     transactions = dashboardAddress[address].transactions.reduce( async (txs, tx) => {
  //       await
  //     }, [])
  //   } catch (error) {
  //     return Promise.reject(error)
  //   }

  //   return transactions
  // }

  // getBlockTime = async (): Promise<number> => {
  //   const blocks: Blocks = await getBlocks(this.electrsAPI)
  //   const times: Array<number> = []
  //   blocks.forEach((block, index: number) => {
  //     if (index !== 0) {
  //       const block1PublishTime = moment.unix(blocks[index - 1].timestamp)
  //       const block2PublishTime = moment.unix(block.timestamp)
  //       times.push(block1PublishTime.diff(block2PublishTime, 'seconds'))
  //     }
  //   })
  //   const avgBlockPublishTime = Utils.arrayAverage(times)
  //   return avgBlockPublishTime
  // }

  // getTxWeight = async (addressTo: string, memo?: string): Promise<number> => {
  //   if (!this.validateAddress(addressTo)) {
  //     throw new Error('Invalid address')
  //   }
  //   const network = this.getNetwork(this.net)
  //   const btcKeys = this.getBtcKeys(this.net, this.phrase)
  //   const balance = this.getBalance()
  //   const balancePlaceholder = balance - Utils.dustThreshold - 1
  //   const psbt = new Bitcoin.Psbt({ network: network }) // Network-specific
  //   this.utxos.forEach((UTXO) =>
  //     psbt.addInput({
  //       hash: UTXO.hash,
  //       index: UTXO.index,
  //       witnessUtxo: UTXO.witnessUtxo,
  //     }),
  //   )
  //   psbt.addOutput({ address: addressTo, value: balancePlaceholder }) // Add output
  //   psbt.addOutput({ address: this.getAddress(), value: 1 }) // change output
  //   if (memo) {
  //     const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
  //     const OP_RETURN = Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
  //     psbt.addOutput({ script: OP_RETURN, value: 0 }) // Add OP_RETURN {script, value}
  //   }
  //   psbt.signAllInputs(btcKeys) // Sign all inputs
  //   const tx = psbt.finalizeAllInputs().extractTransaction() // Finalise inputs, extract tx
  //   const inputs = this.utxos.length // Add weight for each input sig
  //   return tx.virtualSize() + inputs
  // }

  /**
   * getFees
   */
  async getFees(): Promise<Fees> {
    await this.scanUTXOs()
    if (this.utxos.length === 0) {
      throw new Error('No utxos to send')
    }

    const calcdFees = { fast: 0, average: 0, slow: 0 }
    const btcStats = await blockChair.bitcoinStats(this.nodeUrl, this.nodeApiKey)
    const nextBlockFeeRate = btcStats.suggested_transaction_fee_per_byte_sat
    const feesOptions: Fees = {
      fast: 5,
      average: 1,
      slow: 0.5,
    }
    let key: keyof typeof feesOptions
    for (key in feesOptions) {
      const feeRate = nextBlockFeeRate * feesOptions[key]
      calcdFees[key] = feeRate
    }
    return calcdFees
  }

  async getFeesWithMemo(memo: string): Promise<Fees> {
    const OP_RETURN = Utils.compileMemo(memo)
    const fees = await this.getFees()
    const memoFees: Fees = { fast: 0, average: 0, slow: 0 }
    let key: keyof typeof fees
    for (key in fees) {
      memoFees[key] = Utils.getVaultFee(this.utxos, OP_RETURN, fees[key])
    }
    return memoFees
  }

  async deposit({ asset, amount, recipient, memo, feeRate }: TxParams): Promise<string> {
    return this.transfer({ asset, amount, recipient, memo, feeRate })
  }

  async transfer({ asset, amount, recipient, memo, feeRate }: TxParams): Promise<string> {
    const balance = await this.getBalance()
    const btcBalance = balance.find((balance) => balance.coin === asset)
    if (!btcBalance) {
      throw new Error('No btcBalance found')
    }
    if (this.utxos.length === 0) {
      throw new Error('No utxos to send')
    }
    if (!this.validateAddress(recipient)) {
      throw new Error('Invalid address')
    }
    const network = this.getNetwork() == Network.TEST ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    const btcKeys = this.getBtcKeys(this.phrase)
    const feeRateWhole = Number(feeRate.toFixed(0))
    const compiledMemo = memo ? Utils.compileMemo(memo) : null
    const fee = compiledMemo
      ? Utils.getVaultFee(this.utxos, compiledMemo, feeRateWhole)
      : Utils.getNormalFee(this.utxos, feeRateWhole)
    if (fee + amount > btcBalance.amount) {
      throw new Error('Balance insufficient for transaction')
    }
    const psbt = new Bitcoin.Psbt({ network: network }) // Network-specific
    //Inputs
    this.utxos.forEach((UTXO) =>
      psbt.addInput({
        hash: UTXO.hash,
        index: UTXO.index,
        witnessUtxo: UTXO.witnessUtxo,
      }),
    )
    // Outputs
    psbt.addOutput({ address: recipient, value: amount }) // Add output {address, value}
    const change = await this.getChange(amount + fee)
    if (change > 0) {
      psbt.addOutput({ address: this.getAddress(), value: change }) // Add change
    }
    if (compiledMemo) {
      // if memo exists
      psbt.addOutput({ script: compiledMemo, value: 0 }) // Add OP_RETURN {script, value}
    }
    psbt.signAllInputs(btcKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs
    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex
    return await blockChair.broadcastTx(this.nodeUrl, txHex, this.nodeApiKey)
  }
}

export { Client, Network }
