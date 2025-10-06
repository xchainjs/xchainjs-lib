import {
  AssetInfo,
  FeeType,
  Fees,
  Balance,
  Network,
  TxHash,
  BaseXChainClient,
  ExplorerProviders,
  TxParams,
  PreparedTx,
  TxsPage,
  TxHistoryParams,
  Tx,
  FeesWithRates,
  FeeRate,
} from '@xchainjs/xchain-client'
import { baseAmount, Address, AssetType, BaseAmount } from '@xchainjs/xchain-util'
import { TronWeb } from 'tronweb'

import {
  AssetTRX,
  TRONChain,
  TRON_DERIVATION_PATH,
  TRX_DECIMAL,
  tronExplorerProviders,
  TRON_DEFAULT_RPC,
  TRON_USDT_CONTRACT,
  TRX_TRANSFER_BANDWIDTH,
  TRC20_TRANSFER_ENERGY,
  TRC20_TRANSFER_BANDWIDTH,
  TRX_FEE_LIMIT,
  MAX_APPROVAL,
} from './const'
import { validateAddress, getTRC20AssetContractAddress } from './utils'
import trc20ABI from './utils/trc20.json'
import {
  TRONClientParams,
  TronTransaction,
  TronSignedTransaction,
  ApproveParams,
  IsApprovedParams,
  TronGetApprovedParams,
} from './types'
import { TronGrid } from './utils/trongrid'

// Default parameters for the Tron client
export const defaultTRONParams: TRONClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: tronExplorerProviders,
  rootDerivationPaths: {
    [Network.Mainnet]: TRON_DERIVATION_PATH,
    [Network.Testnet]: TRON_DERIVATION_PATH,
    [Network.Stagenet]: TRON_DERIVATION_PATH,
  },
}

export abstract class Client extends BaseXChainClient {
  protected explorerProviders: ExplorerProviders
  protected tronWeb: TronWeb
  protected tronGrid: TronGrid

  constructor(params: TRONClientParams = defaultTRONParams) {
    const clientParams = { ...defaultTRONParams, ...params }

    super(TRONChain, clientParams)
    this.explorerProviders = clientParams.explorerProviders
    this.tronWeb = new TronWeb({ fullHost: TRON_DEFAULT_RPC })
    this.tronGrid = new TronGrid()
  }

  /**
   * Get TRX asset info.
   * @returns {AssetInfo} TRX asset information.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetTRX,
      decimal: TRX_DECIMAL,
    }
    return assetInfo
  }

  /**
   * Get the explorer URL.
   *
   * @returns {string} The explorer URL.
   */
  public getExplorerUrl(): string {
    return this.explorerProviders[this.getNetwork()].getExplorerUrl()
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  public getExplorerAddressUrl(address: Address): string {
    return this.explorerProviders[this.getNetwork()].getExplorerAddressUrl(address)
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  public getExplorerTxUrl(txID: TxHash): string {
    return this.explorerProviders[this.getNetwork()].getExplorerTxUrl(txID)
  }

  /**
   * Validate the given Tron address.
   * @param {string} address Tron address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  validateAddress(address: string): boolean {
    return validateAddress(address)
  }

  /**
   * Get token balance and info directly from contract
   */
  public fetchTokenMetadata = async ({ contractAddress }: { contractAddress: string }) => {
    const contract = this.tronWeb.contract(trc20ABI, contractAddress)

    const [symbolRaw, decimalsRaw] = await Promise.all([
      contract
        .symbol()
        .call()
        .catch(() => 'UNKNOWN'),
      contract
        .decimals()
        .call()
        .catch(() => '18'),
    ])

    return { decimals: Number(decimalsRaw ?? 18), symbol: symbolRaw ?? 'UNKNOWN' }
  }

  /**
   * Get token balance and info directly from contract
   */
  public fetchTokenBalance = async ({ contractAddress, address }: { contractAddress: string; address: string }) => {
    try {
      const contract = this.tronWeb.contract(trc20ABI, contractAddress)

      if (!contract.methods?.balanceOf) {
        return BigInt(0)
      }

      const [balance] = await contract.methods.balanceOf(address).call()

      return balance ? (typeof balance === 'bigint' ? balance : BigInt(balance)) : BigInt(0)
    } catch (err) {
      console.warn(`balanceOf() failed for ${contractAddress}:`, err)
      return BigInt(0)
    }
  }

  /**
   * Get current chain parameters including resource prices
   */
  getChainParameters = async () => {
    try {
      const parameters = await this.tronWeb.trx.getChainParameters()
      const paramMap: Record<string, number> = {}

      for (const param of parameters) {
        paramMap[param.key] = param.value
      }

      return {
        bandwidthFee: paramMap.getTransactionFee || 1000, // SUN per bandwidth unit
        createAccountFee: paramMap.getCreateAccountFee || 100000, // 0.1 TRX in SUN
        energyFee: paramMap.getEnergyFee || 420, // SUN per energy unit
      }
    } catch {
      // Return default values if unable to fetch
      return { bandwidthFee: 1000, createAccountFee: 100000, energyFee: 420 }
    }
  }

  /**
   * Check if an address exists on the blockchain
   */
  accountExists = async (address: string) => {
    try {
      const account = await this.tronWeb.trx.getAccount(address)
      return account && Object.keys(account).length > 0
    } catch {
      return false
    }
  }

  /**
   * Get account resources (bandwidth and energy)
   */
  getAccountResources = async (address: string) => {
    try {
      const resources = await this.tronWeb.trx.getAccountResources(address)

      return {
        bandwidth: {
          free: (resources?.freeNetLimit ?? 0) - (resources?.freeNetUsed ?? 0),
          total: resources.NetLimit || 0,
          used: resources.NetUsed || 0,
        },
        energy: { total: resources.EnergyLimit || 0, used: resources.EnergyUsed || 0 },
      }
    } catch {
      // Return default structure if unable to fetch
      return {
        bandwidth: { free: 600, total: 0, used: 0 }, // 600 free bandwidth daily
        energy: { total: 0, used: 0 },
      }
    }
  }

  /**
   * Retrieves the balance of a given address.
   * @param {Address} address - The address to retrieve the balance for.
   * @param {TokenAsset[]} assets - Assets to retrieve the balance for (optional).
   * @returns {Promise<Balance[]>} An array containing the balance of the address.
   */
  public async getBalance(address: Address): Promise<Balance[]> {
    const ZeroBalance = [
      {
        asset: AssetTRX,
        amount: baseAmount(0, TRX_DECIMAL),
      },
    ]

    // Try get balance from TronGrid
    try {
      const accountData = await this.tronGrid.getAccount(address)

      if (!accountData) return ZeroBalance
      const balances: Balance[] = []
      // Add TRX balance
      balances.push({
        asset: AssetTRX,
        amount: baseAmount(accountData.balance, TRX_DECIMAL),
      })

      // Add TRC20 balances
      for (const token of accountData.trc20) {
        const entries = Object.entries(token)
        if (entries.length !== 1) continue
        const [contractAddress, balance] = entries[0]

        if (!(contractAddress && balance)) continue

        const tokenMetaData = await this.fetchTokenMetadata({ contractAddress })

        if (!tokenMetaData) continue

        balances.push({
          asset: {
            chain: TRONChain,
            symbol: `${tokenMetaData.symbol}-${contractAddress}`,
            ticker: tokenMetaData.symbol,
            type: AssetType.TOKEN,
          },
          amount: baseAmount(balance || 0, tokenMetaData.decimals),
        })
      }

      return balances
    } catch (_error) {
      // Fallback: get TRX and USDT Balance from TronWeb
      const balances: Balance[] = []

      const trxBalanceInSun = await this.tronWeb.trx.getBalance(address)
      if (trxBalanceInSun && Number(trxBalanceInSun) > 0) {
        balances.push({
          asset: AssetTRX,
          amount: baseAmount(trxBalanceInSun, TRX_DECIMAL),
        })
      }

      const usdtBalance = await this.fetchTokenBalance({ address, contractAddress: TRON_USDT_CONTRACT })
      if (usdtBalance) {
        balances.push({
          asset: {
            chain: TRONChain,
            symbol: `USDT-${TRON_USDT_CONTRACT}`,
            ticker: 'USDT',
            type: AssetType.TOKEN,
          },
          amount: baseAmount(usdtBalance.toString(), 6),
        })
      }

      return balances
    }
  }

  /**
   * Get transaction fees.
   * @param {TxParams} params - Tx param
   * @returns {Fees} The average, fast, and fastest fees.
   */
  public async getFees(params?: TxParams): Promise<Fees> {
    if (!params) throw new Error('Params need to be passed')

    const { asset, recipient, walletIndex } = params
    const isNative = asset?.type === AssetType.NATIVE
    let feeAmount: BaseAmount

    // Get sender address
    const senderAddress = await this.getAddressAsync(walletIndex)
    if (!senderAddress) {
      // If no signer, return default fee
      feeAmount = isNative ? baseAmount(0.1 * 10 ** 6, TRX_DECIMAL) : baseAmount(15 * 10 ** 6, TRX_DECIMAL)
    } else {
      // Get chain parameters for current resource prices
      const chainParams = await this.getChainParameters()

      // Check if recipient account exists (new accounts require activation fee)
      const recipientExists = await this.accountExists(recipient)
      const activationFee = recipientExists ? 0 : chainParams.createAccountFee

      // Get account resources
      const resources = await this.getAccountResources(senderAddress)

      if (isNative) {
        // Calculate bandwidth needed for TRX transfer
        const bandwidthNeeded = TRX_TRANSFER_BANDWIDTH
        const availableBandwidth = resources.bandwidth.free + (resources.bandwidth.total - resources.bandwidth.used)

        let bandwidthFee = 0
        if (bandwidthNeeded > availableBandwidth) {
          // Need to burn TRX for bandwidth
          const bandwidthToBuy = bandwidthNeeded - availableBandwidth
          bandwidthFee = bandwidthToBuy * chainParams.bandwidthFee
        }

        // Total fee in SUN
        const totalFeeSun = activationFee + bandwidthFee

        feeAmount = baseAmount(totalFeeSun, TRX_DECIMAL)
      } else {
        // TRC20 Transfer - needs both bandwidth and energy
        const bandwidthNeeded = TRC20_TRANSFER_BANDWIDTH
        const energyNeeded = TRC20_TRANSFER_ENERGY

        const availableBandwidth = resources.bandwidth.free + (resources.bandwidth.total - resources.bandwidth.used)
        const availableEnergy = resources.energy.total - resources.energy.used

        let bandwidthFee = 0
        if (bandwidthNeeded > availableBandwidth) {
          const bandwidthToBuy = bandwidthNeeded - availableBandwidth
          bandwidthFee = bandwidthToBuy * chainParams.bandwidthFee
        }

        let energyFee = 0
        if (energyNeeded > availableEnergy) {
          const energyToBuy = energyNeeded - availableEnergy
          energyFee = energyToBuy * chainParams.energyFee
        }

        // Total fee in SUN
        const totalFeeSun = activationFee + bandwidthFee + energyFee
        feeAmount = baseAmount(totalFeeSun, TRX_DECIMAL)
      }
    }

    // Tron has Fixed Fee model, unlike ETH or BTC
    return {
      average: feeAmount,
      fast: feeAmount,
      fastest: feeAmount,
      type: FeeType.FlatFee,
    }
  }

  createTransaction = async (params: TxParams) => {
    const { asset, amount: baseValue, recipient, memo, walletIndex } = params
    if (!asset) throw Error('Asset not provided')

    const sender = await this.getAddressAsync(walletIndex)
    const amount = baseValue.amount().toString()

    if (asset.type === AssetType.NATIVE) {
      const transaction = await this.tronWeb.transactionBuilder.sendTrx(recipient, Number(amount), sender)

      if (memo) {
        return this.tronWeb.transactionBuilder.addUpdateData(transaction, memo, 'utf8')
      }

      return transaction
    }

    const contractAddress = getTRC20AssetContractAddress(asset)
    if (!contractAddress) {
      throw new Error('TRC20 Asset Contract Address is not valid')
    }

    // Build TRC20 transfer transaction
    const functionSelector = 'transfer(address,uint256)'
    const parameter = [
      { type: 'address', value: recipient },
      { type: 'uint256', value: amount },
    ]

    const options = { callValue: 0, feeLimit: TRX_FEE_LIMIT }
    const res = await this.tronWeb.transactionBuilder.triggerSmartContract(
      contractAddress,
      functionSelector,
      options,
      parameter,
      sender,
    )

    // Some nodes don’t throw; they return result=false + message
    if (!(res?.result?.result && res?.transaction)) {
      throw new Error(res?.result?.message)
    }

    // Attach memo if requested
    const tx = memo
      ? await this.tronWeb.transactionBuilder.addUpdateData(res.transaction, memo, 'utf8')
      : res.transaction

    return tx
  }

  /**
   * Return signed tx
   * @param transaction TronTransaction
   * @param walletIndex wallet index
   * @returns Transaction signed by phrase
   */
  abstract signTransaction(transaction: TronTransaction, walletIndex?: number): Promise<TronSignedTransaction>

  /**
   * Transfer TRON Asset
   * @param {TxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  public async transfer(params: TxParams): Promise<string> {
    const { asset, amount: baseValue, recipient, memo, walletIndex } = params
    if (!asset) throw Error('Asset not provided')

    const amount = baseValue.amount().toString()
    const sender = await this.getAddressAsync(walletIndex)

    const isNative = asset.type === AssetType.NATIVE

    if (isNative) {
      const transaction = await this.tronWeb.transactionBuilder.sendTrx(recipient, Number(amount), sender)

      if (memo) {
        const transactionWithMemo = await this.tronWeb.transactionBuilder.addUpdateData(transaction, memo, 'utf8')
        const signedTx = await this.signTransaction(transactionWithMemo, walletIndex)
        const { txid } = await this.tronWeb.trx.sendRawTransaction(signedTx)
        return txid
      }

      const signedTx = await this.signTransaction(transaction, walletIndex)
      const { txid } = await this.tronWeb.trx.sendRawTransaction(signedTx)
      return txid
    }

    // TRC20 Token Transfer - always use createTransaction + sign pattern
    const transaction = await this.createTransaction(params)

    const signedTx = await this.signTransaction(transaction, walletIndex)
    const { txid } = await this.tronWeb.trx.sendRawTransaction(signedTx)

    if (!txid) {
      throw new Error('TRON Transfer falied')
    }

    return txid
  }

  /**
   * Check the current allowance for a spender on a token
   */
  public getApprovedAmount = async ({ contractAddress, spenderAddress, from }: TronGetApprovedParams) => {
    this.tronWeb.setAddress(from)

    const contract = this.tronWeb.contract(trc20ABI, contractAddress)

    if (!contract.methods?.allowance) {
      throw new Error('invalid contract')
    }

    const [allowance] = await contract.methods.allowance(from, spenderAddress).call()

    return allowance ? (typeof allowance === 'bigint' ? allowance : BigInt(allowance)) : BigInt(0)
  }

  /**
   * Check TRC20 allowance.
   * @param {Address} contractAddress The contract address.
   * @param {Address} spenderAddress The spender address.
   * @param {BaseAmount} amount The amount to check if it's allowed to spend or not (optional).
   * @param {number} walletIndex (optional) HD wallet index
   * @param {IsApprovedParams} params - Parameters for checking allowance.
   * @returns {boolean} `true` if the allowance is approved, `false` otherwise.
   */
  async isApproved({ contractAddress, spenderAddress, amount, walletIndex }: IsApprovedParams): Promise<boolean> {
    const from = await this.getAddressAsync(walletIndex)

    const allowance = await this.getApprovedAmount({ contractAddress, from, spenderAddress })

    if (!amount) {
      // If no amount specified, check if there's any approval
      return allowance > BigInt(0)
    }

    return allowance >= BigInt(amount.amount().toString())
  }

  /**
   * Approves an allowance for spending tokens.
   *
   * @param {ApproveParams} params - Parameters for approving an allowance.
   * @param {Address} contractAddress The contract address.
   * @param {Address} spenderAddress The spender address.
   * @param {BaseAmount} amount The amount of token. By default, it will be unlimited token allowance. (optional)
   * @param {number} walletIndex (optional) HD wallet index
   * @returns {TransactionResponse} The result of the approval transaction.
   * @throws Error If gas estimation fails.
   */
  public async approve({ contractAddress, spenderAddress, amount, walletIndex = 0 }: ApproveParams): Promise<string> {
    const fromAddress = await this.getAddressAsync(walletIndex)
    const approvalAmount = amount !== undefined ? amount.amount().toString() : MAX_APPROVAL

    // Build approve transaction using triggerSmartContract
    const functionSelector = 'approve(address,uint256)'
    const parameter = [
      { type: 'address', value: spenderAddress },
      { type: 'uint256', value: approvalAmount },
    ]

    const feeLimit = TRX_FEE_LIMIT
    const options = { callValue: 0, feeLimit }

    const { transaction } = await this.tronWeb.transactionBuilder.triggerSmartContract(
      contractAddress,
      functionSelector,
      options,
      parameter,
      fromAddress,
    )

    if (!transaction) {
      throw new Error('Failed to build approve transaction')
    }

    const signedTx = await this.signTransaction(transaction, walletIndex)
    const { txid } = await this.tronWeb.trx.sendRawTransaction(signedTx)

    if (!txid) {
      throw new Error('TRC20 Approve Failed')
    }

    return txid
  }

  public async broadcastTransaction(signedTx: TronSignedTransaction): Promise<TxHash> {
    const { txid } = await this.tronWeb.trx.sendRawTransaction(signedTx)
    return txid
  }

  public async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const address = params?.address || (await this.getAddressAsync())
    const offset = params?.offset || 0
    const limit = params?.limit || 10

    return this.tronGrid.getTransactions({ address, limit, offset })
  }

  /**
   * Get the transaction details of a given transaction ID.
   *
   * @param {string} txId The transaction ID.
   * @returns {Tx} The transaction details.
   */
  public async getTransactionData(txId: string): Promise<Tx> {
    return this.tronGrid.getTransactionData(txId)
  }

  public async broadcastTx(_signedTx: string): Promise<TxHash> {
    throw Error('Error: not supported')
  }

  async prepareTx(_: TxParams & { sender: Address }): Promise<PreparedTx> {
    throw new Error('Error: raw tx string not supported')
  }

  async getFeesWithRates(): Promise<FeesWithRates> {
    throw Error('Error: not supported')
  }

  async getFeeRates(): Promise<FeeRate> {
    throw Error('Error: not supported')
  }
}
