import { Address, BaseAmount, TokenAsset, baseAmount } from '@xchainjs/xchain-util'
import { Signer, Contract, Provider, getAddress, InterfaceAbi, BaseContract } from 'ethers'
import { BigNumber } from 'bignumber.js'

import erc20ABI from './data/erc20.json'
/**
 * Maximum approval amount possible, set to 2^256 - 1.
 */
export const MAX_APPROVAL: BigNumber = new BigNumber(2).pow(256).minus(1)

/**
 * Validate the given address.
 *
 * @param {Address} address The address to validate.
 * @returns {boolean} `true` if the address is valid, otherwise `false`.
 */
export const validateAddress = (address: Address): boolean => {
  try {
    getAddress(address)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get token address from asset.
 *
 * @param {TokenAsset} asset The asset to extract the token address from.
 * @returns {Address|null} The token address if found, otherwise `null`.
 */
export const getTokenAddress = (asset: TokenAsset): Address | null => {
  try {
    // strip 0X only - 0x is still valid
    return getAddress(asset.symbol.slice(asset.ticker.length + 1).replace(/^0X/, ''))
  } catch (err) {
    return null
  }
}

/**
 * Check if the symbol is valid.
 *
 * @param {string|null|undefined} symbol The symbol to validate.
 * @returns {boolean} `true` if the symbol is valid and has a length of at least 3, otherwise `false`.
 */
export const validateSymbol = (symbol?: string | null): boolean => (symbol ? symbol.length >= 3 : false)

/**
 * Calculate fees by multiplying gas price and gas limit.
 *
 * @returns {Fees} The calculated fee.
 */
export const getFee = ({
  gasPrice,
  gasLimit,
  decimals,
}: {
  gasPrice: BaseAmount
  gasLimit: BigNumber
  decimals: number
}): BaseAmount => baseAmount(gasPrice.amount().multipliedBy(gasLimit.toString()), decimals)

/**
 * Get address prefix based on the network.
 *
 * @returns {string} The address prefix based on the network ('0x').
 */
export const getPrefix = () => '0x'

/**
 * Filter self transactions from an array of transactions.
 *
 * @param {T[]} txs The transactions array.
 * @returns {T[]} The filtered transactions array with self transactions removed.
 */
export const filterSelfTxs = <T extends { from: string; to: string; hash: string }>(txs: T[]): T[] => {
  const filterTxs = txs.filter((tx) => tx.from !== tx.to)
  let selfTxs = txs.filter((tx) => tx.from === tx.to)
  while (selfTxs.length) {
    const selfTx = selfTxs[0]
    filterTxs.push(selfTx)
    selfTxs = selfTxs.filter((tx) => tx.hash !== selfTx.hash)
  }

  return filterTxs
}

/**
 * Returns approval amount. If amount is not set or zero, returns `MAX_APPROVAL`.
 *
 * @param {BaseAmount} amount The amount to check.
 * @returns {ethers.BigNumber} The approval amount.
 */
export const getApprovalAmount = (amount?: BaseAmount): BigNumber =>
  amount && amount.gt(baseAmount(0, amount.decimal)) ? new BigNumber(amount.amount().toFixed()) : MAX_APPROVAL

/**
 * Estimate gas required for calling a contract function.
 *
 * @param {object} params Parameters for estimating gas.
 * @param {Provider} provider Provider to interact with the contract.
 * @param {Address} contractAddress The contract address.
 * @param {ContractInterface} abi The contract ABI json.
 * @param {string} funcName The function to be called.
 * @param {unknown[]} funcParams The parameters of the function.
 * @returns {BigNumber} The estimated gas required for the function call.
 */
export const estimateCall = async ({
  provider,
  contractAddress,
  abi,
  funcName,
  funcParams = [],
}: {
  provider: Provider
  contractAddress: Address
  abi: InterfaceAbi
  funcName: string
  funcParams?: unknown[]
}): Promise<BigNumber> => {
  const contract = new Contract(contractAddress, abi, provider)
  const estiamtion = await contract.getFunction(funcName).estimateGas(...funcParams)
  return await new BigNumber(estiamtion.toString())
}
/**
 * Calls a contract function.
 *
 * @param {Provider} provider The provider to interact with the contract.
 * @param {Signer} signer The signer of the transaction (optional - needed for sending transactions only).
 * @param {Address} contractAddress The contract address.
 * @param {ContractInterface} abi The contract ABI json.
 * @param {string} funcName The function to be called.
 * @param {unknown[]} funcParams (optional) The parameters of the function.
 * @returns {Promise<T>} The result of the contract function call.
 */
export const call = async <T>({
  provider,
  signer,
  contractAddress,
  abi,
  funcName,
  funcParams = [],
}: {
  provider: Provider
  signer?: Signer
  contractAddress: Address
  abi: InterfaceAbi
  funcName: string
  funcParams?: unknown[]
}): Promise<T> => {
  let contract: BaseContract = new Contract(contractAddress, abi, provider)
  if (signer) {
    // For sending transactions, a signer is needed
    contract = contract.connect(signer)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (contract as any)[funcName](...funcParams)
}

/**
 * Load a contract.
 *
 * @param {Provider} provider The provider to interact with the contract.
 * @param {Address} contractAddress The contract address.
 * @param {ContractInterface} abi The contract ABI json.
 * @returns {Promise<ethers.Contract>} The loaded contract instance.
 */
export const getContract = async ({
  provider,
  contractAddress,
  abi,
}: {
  provider: Provider
  contractAddress: Address
  abi: InterfaceAbi
}): Promise<Contract> => {
  return new Contract(contractAddress, abi, provider)
}

/**
 * Estimate gas for calling `approve`.
 *
 * @param {Provider} provider The provider to interact with the contract.
 * @param {Address} contractAddress The contract address.
 * @param {Address} spenderAddress The spender address.
 * @param {Address} fromAddress The address a transaction is sent from.
 * @param {ContractInterface} abi The contract ABI json.
 * @param {BaseAmount} amount (optional) The amount of token. By default, it will be unlimited token allowance.
 * @returns {Promise<ethers.BigNumber>} The estimated gas.
 */
export async function estimateApprove({
  provider,
  contractAddress,
  spenderAddress,
  fromAddress,
  abi,
  amount,
}: {
  provider: Provider
  contractAddress: Address
  spenderAddress: Address
  fromAddress: Address
  abi: InterfaceAbi
  amount?: BaseAmount
}): Promise<BigNumber> {
  const txAmount = getApprovalAmount(amount)
  return await estimateCall({
    provider,
    contractAddress,
    abi,
    funcName: 'approve',
    funcParams: [spenderAddress, BigInt(txAmount.toFixed(0)), { from: fromAddress }],
  })
}

/**
 * Check allowance.
 *
 * @param {Provider} provider The provider to interact with the contract.
 * @param {Address} contractAddress The contract (ERC20 token) address.
 * @param {Address} spenderAddress The spender address (router).
 * @param {Address} fromAddress The address a transaction is sent from.
 * @param {BaseAmount} amount The amount to check if it's allowed to spend or not (optional).
 * @param {number} walletIndex (optional) HD wallet index
 * @returns {Promise<boolean>} `true` if the spender is allowed to spend the specified amount, `false` otherwise.
 */
export async function isApproved({
  provider,
  contractAddress,
  spenderAddress,
  fromAddress,
  amount,
}: {
  provider: Provider
  contractAddress: Address
  spenderAddress: Address
  fromAddress: Address
  amount?: BaseAmount
}): Promise<boolean> {
  const txAmount = new BigNumber(amount?.amount().toFixed() ?? 1)
  const contract: Contract = new Contract(contractAddress, erc20ABI, provider)
  const allowanceResponse = await contract.allowance(fromAddress, spenderAddress)
  const allowance: BigNumber = new BigNumber(allowanceResponse.toString())

  return txAmount.lte(allowance)
}

/**
 * Removes `0x` or `0X` from the beginning of the address string.
 *
 * @param {Address} addr The address to remove the `0x` or `0X` prefix from.
 * @returns {string} The address without the `0x` or `0X` prefix.
 */
export const strip0x = (addr: Address) => addr.replace(/^0(x|X)/, '')

/**
 * Get the chain identifier the provider is connected with
 * @param {Provider} provider Provider
 * @returns {number} the chain identifier the provider is connected with
 */
export const getNetworkId = async (provider: Provider): Promise<number> => {
  const network = await provider.getNetwork()
  return Number(network.chainId)
}
