import { LTSRadixEngineToolkit, NetworkId, PrivateKey, RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit'
import {
  AssetInfo,
  Balance,
  BaseXChainClient,
  Fees,
  Network,
  PreparedTx,
  Tx,
  TxHistoryParams,
  TxParams,
  TxsPage,
} from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto/lib'
import { Address, Asset } from '@xchainjs/xchain-util'

const axios = require('axios')

class RadixClient extends BaseXChainClient {
  /**
   * Get transaction fees.
   *
   * @param {TxParams} params - The transaction parameters.
   * @returns {Fees} The average, fast, and fastest fees.
   * @throws {"Params need to be passed"} Thrown if parameters are not provided.
   */
  getFees(): never
  getFees(params: TxParams): Promise<Fees>
  async getFees(params?: TxParams): Promise<Fees> {
    if (!params) throw new Error('Params need to be passed')
    const fees = await this.estimateFees(params)
    return fees
  }

  /**
   * Get the address for a given account.
   * @deprecated Use getAddressAsync instead.
   */
  getAddress(): string {
    throw new Error('getAddress is synchronous and cannot retrieve addresses directly. Use getAddressAsync instead.')
  }

  /**
   * Get the current address asynchronously for a given account.
   * @returns {Address} A promise resolving to the current address.
   * @throws {Error} Thrown if the phrase has not been set before.
   * A phrase is needed to create a wallet and to derive an address from it.
   */
  async getAddressAsync(): Promise<string> {
    if (!this.phrase) throw new Error('Phrase not set')
    const seed = getSeed(this.phrase)
    const hexString = seed.toString('hex')
    const privateKey = new PrivateKey.Ed25519(hexString)
    const publicKey = privateKey.publicKey()
    const network = this.getNetwork()
    const networkId = network === Network.Mainnet ? NetworkId.Mainnet : NetworkId.Stokenet
    const address = await LTSRadixEngineToolkit.Derive.virtualAccountAddress(publicKey, networkId)
    return address.toString()
  }

  /**
   * Get the explorer URL based on the network.
   *
   * @returns {string} The explorer URL based on the network.
   */
  getExplorerUrl(): string {
    switch (this.getNetwork()) {
      case Network.Mainnet:
        return 'https://explorer.radixdlt.com'
      case Network.Testnet:
        return 'https://stokenet-dashboard.radixdlt.com/'
      default:
        throw new Error('Unsupported network')
    }
  }

  /**
   * Get the explorer URL for a given account address based on the network.
   * @param {Address} address The address to generate the explorer URL for.
   * @returns {string} The explorer URL for the given address.
   */
  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/account/${address}`
  }

  /**
   * Get the explorer URL for a given transaction ID based on the network.
   * @param {string} txID The transaction ID to generate the explorer URL for.
   * @returns {string} The explorer URL for the given transaction ID.
   */
  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/transactions/${txID}`
  }

  /**
   *  Validate the given address.
   * @param {Address} address The address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  validateAddress(address: string): boolean {
    try {
      RadixEngineToolkit.Address.decode(address)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Retrieves the balance of a given address.
   * @param {Address} address - The address to retrieve the balance for.
   * @param {Asset[]} assets - Assets to retrieve the balance for (optional).
   * @returns {Promise<Balance[]>} An array containing the balance of the address.
   * @throws {"Invalid asset"} Thrown when the provided asset is invalid.
   */
  async getBalance(address: string, assets?: Asset[] | undefined): Promise<Balance[]> {
    console.log(address + assets)
    try {
      // Assuming walletIndex is used to construct the URL
      const url = `https://jsonplaceholder.typicode.com/posts/}`
      console.log('Making GET request to:', url)
      const response = await axios.get(url)
      console.log('Response data:', response.data)
      // Assuming the response contains an address field
      const address = response.data.address
      return address
    } catch (error) {
      console.error('Error fetching address:', error)
      throw error
    }
  }
  async getTransactions(params?: TxHistoryParams | undefined): Promise<TxsPage> {
    try {
      console.log(params)
      // Assuming walletIndex is used to construct the URL
      const url = `https://jsonplaceholder.typicode.com/posts/`
      console.log('Making GET request to:', url)
      const response = await axios.get(url)
      console.log('Response data:', response.data)
      // Assuming the response contains an address field
      const address = response.data.address
      return address
    } catch (error) {
      console.error('Error fetching address:', error)
      throw error
    }
  }
  async getTransactionData(txId: string, assetAddress?: string | undefined): Promise<Tx> {
    try {
      console.log(txId + assetAddress)
      // Assuming walletIndex is used to construct the URL
      const url = `https://jsonplaceholder.typicode.com/posts/`
      console.log('Making GET request to:', url)
      const response = await axios.get(url)
      console.log('Response data:', response.data)
      // Assuming the response contains an address field
      const address = response.data.address
      return address
    } catch (error) {
      console.error('Error fetching address:', error)
      throw error
    }
  }
  async transfer(params: TxParams): Promise<string> {
    try {
      console.log(params)
      // Assuming walletIndex is used to construct the URL
      const url = `https://jsonplaceholder.typicode.com/posts/`
      console.log('Making GET request to:', url)
      const response = await axios.get(url)
      console.log('Response data:', response.data)
      // Assuming the response contains an address field
      const address = response.data.address
      return address
    } catch (error) {
      console.error('Error fetching address:', error)
      throw error
    }
  }
  async broadcastTx(txHex: string): Promise<string> {
    try {
      console.log(txHex)
      // Assuming walletIndex is used to construct the URL
      const url = `https://jsonplaceholder.typicode.com/posts/`
      console.log('Making GET request to:', url)
      const response = await axios.get(url)
      console.log('Response data:', response.data)
      // Assuming the response contains an address field
      const address = response.data.address
      return address
    } catch (error) {
      console.error('Error fetching address:', error)
      throw error
    }
  }
  getAssetInfo(): AssetInfo {
    throw new Error('Method not implemented.')
  }
  async prepareTx(params: TxParams): Promise<PreparedTx> {
    try {
      console.log(params)
      // Assuming walletIndex is used to construct the URL
      const url = `https://jsonplaceholder.typicode.com/posts/`
      console.log('Making GET request to:', url)
      const response = await axios.get(url)
      console.log('Response data:', response.data)
      // Assuming the response contains an address field
      const address = response.data.address
      return address
    } catch (error) {
      console.error('Error fetching address:', error)
      throw error
    }
  }
  async estimateFees(params?: TxParams): Promise<Fees> {
    try {
      console.log(params)
      // check if we can estimate the fees using the transaction manifest somehow
      // if we can estimate them, do an http request and return the fees
      const url = `fees_estimation_url`
      console.log('Making GET request to:', url)
      const response = await axios.get(url)
      console.log('Response data:', response.data)
      const fees = response.data.fees
      return fees
    } catch (error) {
      console.error('Error fetching address:', error)
      throw error
    }
  }
}

export { RadixClient }
