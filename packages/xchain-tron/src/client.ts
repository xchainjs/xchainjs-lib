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
  TRC20_TRANSFER_ENERGY_EMPTY,
  TRC20_TRANSFER_BANDWIDTH,
  applyDynamicEnergy,
  TRX_FEE_LIMIT,
  MAX_APPROVAL,
  TRON_TOKEN_WHITELIST,
  TokenMetadata,
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
   * Get token metadata from whitelist if available
   */
  private getTokenFromWhitelist(contractAddress: string): TokenMetadata | null {
    return TRON_TOKEN_WHITELIST[contractAddress] || null
  }

  /**
   * Get token balance and info directly from contract
   */
  public fetchTokenMetadata = async ({ contractAddress }: { contractAddress: string }) => {
    // First check whitelist for known tokens - faster and more reliable
    const whitelistData = this.getTokenFromWhitelist(contractAddress)
    if (whitelistData) {
      return whitelistData
    }

    // Try contract calls for unknown tokens
    try {
      // Set address if available to avoid owner_address error
      const address = await this.getAddressAsync().catch(() => null)
      if (address) {
        this.tronWeb.setAddress(address)
      }

      const contract = this.tronWeb.contract(trc20ABI, contractAddress)

      const [symbolRaw, decimalsRaw] = await Promise.all([
        contract.methods.symbol().call(),
        contract.methods.decimals().call(),
      ])

      return { decimals: Number(decimalsRaw ?? 18), symbol: symbolRaw ?? 'UNKNOWN' }
    } catch (error) {
      console.warn(
        `Contract call failed for ${contractAddress}:`,
        error instanceof Error ? error.message : String(error),
      )
      return { decimals: 18, symbol: 'UNKNOWN' }
    }
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
        memoFee: paramMap.getMemoFee || 1_000_000, // 1 TRX
      }
    } catch {
      // Return default values if unable to fetch
      return { bandwidthFee: 1000, createAccountFee: 100000, energyFee: 420, memoFee: 1_000_000 }
    }
  }

  /**
   * Contract dynamic-energy factor. 0 means the opcode base energy is unchanged.
   * USDT sits well above 0, so a flat 13,000-energy quote underprices the call.
   */
  private getEnergyFactor = async (contractAddress: string): Promise<number> => {
    try {
      const info = await this.tronWeb.fullNode.request<{ contract_state?: { energy_factor?: number | string } }>(
        'wallet/getcontractinfo',
        { value: contractAddress, visible: true },
        'post',
      )
      const factor = Number(info?.contract_state?.energy_factor ?? 0)
      return Number.isFinite(factor) && factor > 0 ? factor : 0
    } catch {
      return 0
    }
  }

  /**
   * Energy a successful TRC20 transfer actually consumes, penalty included.
   * A reverted constant call throws, and its partial energy_used is not the cost of a real transfer.
   */
  private simulateTrc20TransferEnergy = async ({
    contractAddress,
    sender,
    recipient,
    amount,
  }: {
    contractAddress: string
    sender: string
    recipient?: string
    amount?: BaseAmount
  }): Promise<number | undefined> => {
    if (!recipient || !amount) return undefined
    try {
      const res = await this.tronWeb.transactionBuilder.triggerConstantContract(
        contractAddress,
        'transfer(address,uint256)',
        {},
        [
          { type: 'address', value: recipient },
          { type: 'uint256', value: amount.amount().toString() },
        ],
        sender,
      )
      if (res?.result?.result && typeof res.energy_used === 'number' && res.energy_used > 0) {
        return res.energy_used
      }
    } catch {
      // Reverted simulations throw. Fall back to the factored base energy.
    }
    return undefined
  }

  private trc20BaseEnergy = async (contractAddress: string, recipient?: string): Promise<number> => {
    if (!recipient) return TRC20_TRANSFER_ENERGY
    const balance = await this.fetchTokenBalance({ contractAddress, address: recipient })
    return balance > BigInt(0) ? TRC20_TRANSFER_ENERGY : TRC20_TRANSFER_ENERGY_EMPTY
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

    const { asset, recipient, walletIndex, memo, amount } = params
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
      const recipientExists = recipient ? await this.accountExists(recipient) : true
      const activationFee = recipientExists ? 0 : chainParams.createAccountFee
      const memoBytes = memo ? Buffer.byteLength(memo, 'utf8') : 0
      const memoFee = memo ? chainParams.memoFee : 0

      // Get account resources
      const resources = await this.getAccountResources(senderAddress)
      const availableBandwidth = resources.bandwidth.free + (resources.bandwidth.total - resources.bandwidth.used)

      if (isNative) {
        // Calculate bandwidth needed for TRX transfer
        const bandwidthNeeded = TRX_TRANSFER_BANDWIDTH + memoBytes

        let bandwidthFee = 0
        if (bandwidthNeeded > availableBandwidth) {
          // Need to burn TRX for bandwidth
          const bandwidthToBuy = bandwidthNeeded - availableBandwidth
          bandwidthFee = bandwidthToBuy * chainParams.bandwidthFee
        }

        // Total fee in SUN
        const totalFeeSun = activationFee + bandwidthFee + memoFee

        feeAmount = baseAmount(totalFeeSun, TRX_DECIMAL)
      } else {
        // TRC20 transfer. A constant call includes the dynamic energy penalty.
        // Without a recipient or amount, scale the base energy by the contract factor.
        const contractAddress = asset ? getTRC20AssetContractAddress(asset) : TRON_USDT_CONTRACT
        if (!contractAddress) {
          throw new Error('TRC20 Asset Contract Address is not valid')
        }

        const simulated = await this.simulateTrc20TransferEnergy({
          contractAddress,
          sender: senderAddress,
          recipient,
          amount,
        })
        let energyNeeded = simulated
        if (energyNeeded == null) {
          const baseEnergy = await this.trc20BaseEnergy(contractAddress, recipient)
          energyNeeded = applyDynamicEnergy(baseEnergy, await this.getEnergyFactor(contractAddress))
        }

        const bandwidthNeeded = TRC20_TRANSFER_BANDWIDTH + memoBytes
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
        const totalFeeSun = activationFee + bandwidthFee + energyFee + memoFee
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
   * Decode TRON error message from hex to UTF-8
   * @param message Hex-encoded error message from TRON node
   * @returns Decoded error message or fallback
   */
  private decodeTronError(message?: string): string {
    if (!message) return 'Transaction failed'
    try {
      return Buffer.from(message, 'hex').toString('utf8')
    } catch {
      return message
    }
  }

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
        const { result, txid, message } = await this.tronWeb.trx.sendRawTransaction(signedTx)
        if (!result) {
          throw new Error(this.decodeTronError(message))
        }
        return txid
      }

      const signedTx = await this.signTransaction(transaction, walletIndex)
      const { result, txid, message } = await this.tronWeb.trx.sendRawTransaction(signedTx)
      if (!result) {
        throw new Error(this.decodeTronError(message))
      }
      return txid
    }

    // TRC20 Token Transfer - always use createTransaction + sign pattern.
    // Refuse before signing when the TRX balance cannot cover energy, bandwidth, and the memo fee.
    const fees = await this.getFees(params)
    const requiredSun = fees.fast.amount().toNumber()
    const trxBalanceSun = Number(await this.tronWeb.trx.getBalance(sender))
    if (trxBalanceSun < requiredSun) {
      throw new Error(
        `Insufficient TRX for energy. Need ${requiredSun / 1e6} TRX, wallet has ${trxBalanceSun / 1e6} TRX.`,
      )
    }

    const transaction = await this.createTransaction(params)

    const signedTx = await this.signTransaction(transaction, walletIndex)
    const { result, txid, message } = await this.tronWeb.trx.sendRawTransaction(signedTx)
    if (!result) {
      throw new Error(this.decodeTronError(message))
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
