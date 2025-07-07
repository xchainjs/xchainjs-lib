import { Address, Asset, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import { Signer, getAddress, Contract, InterfaceAbi, Provider, BaseContract } from 'ethers'
import BigNumber from 'bignumber.js'

import erc20ABI from './erc20.json'

export const MAX_APPROVAL: BigNumber = new BigNumber(2).pow(256).minus(1)

/**
 * Validate the given address.
 *
 * @param {Address} address
 * @returns {boolean} `true` or `false`
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
 * @param {Asset} asset
 * @returns {Address|null} The token address.
 */
export const getTokenAddress = (asset: Asset): Address | null => {
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
 * @param {string|null|undefined} symbol
 * @returns {boolean} `true` or `false`.
 */
export const validateSymbol = (symbol?: string | null): boolean => (symbol ? symbol.length >= 3 : false)

/**
 * Calculate fees by multiplying .
 *
 * @returns {BaseAmount} The default gas price.
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
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = () => '0x'

/**
 * Filter self txs
 *
 * @returns {T[]}
 *
 **/
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
 * Returns approval amount
 *
 * If given amount is not set or zero, `MAX_APPROVAL` amount is used
 */
export const getApprovalAmount = (amount?: BaseAmount): BigNumber =>
  amount && amount.gt(baseAmount(0, amount.decimal)) ? new BigNumber(amount.amount().toFixed()) : MAX_APPROVAL

/**
 * Call a contract function.
 *
 * @param {Provider} provider Provider to interact with the contract.
 * @param {Address} contractAddress The contract address.
 * @param {ContractInterface} abi The contract ABI json.
 * @param {string} funcName The function to be called.
 * @param {unknown[]} funcParams The parameters of the function.
 * @returns {BigNumber} The result of the contract function call.
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
  const contract: Contract = new Contract(contractAddress, abi, provider)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await (contract.estimateGas as any)[funcName](...funcParams)
}

/**
 * Calls a contract function.
 *
 * @param {Provider} provider Provider to interact with the contract.
 * @param {signer} Signer of the transaction (optional - needed for sending transactions only)
 * @param {Address} contractAddress The contract address.
 * @param {ContractInterface} abi The contract ABI json.
 * @param {string} funcName The function to be called.
 * @param {unknow[]} funcParams (optional) The parameters of the function.
 *
 * @returns {T} The result of the contract function call.

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
    // For sending transactions a signer is needed
    contract = contract.connect(signer)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (contract as any)[funcName](...funcParams)
}

/**
 * Estimate gas for calling `approve`.
 *
 * @param {Provider} provider Provider to interact with the contract.
 * @param {Address} contractAddress The contract address.
 * @param {Address} spenderAddress The spender address.
 * @param {Address} fromAddress The address a transaction is sent from.
 * @param {BaseAmount} amount (optional) The amount of token. By default, it will be unlimited token allowance.
 *
 * @returns {BigNumber} Estimated gas
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
 * @param {Provider} provider Provider to interact with the contract.
 * @param {Address} contractAddress The contract (ERC20 token) address.
 * @param {Address} spenderAddress The spender address (router).
 * @param {Address} fromAddress The address a transaction is sent from.
 * @param {BaseAmount} amount The amount to check if it's allowed to spend or not (optional).
 * @param {number} walletIndex (optional) HD wallet index
 * @returns {boolean} `true` or `false`.
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
  const allowance = (await contract.allowance(fromAddress, spenderAddress)) as bigint

  return txAmount.lte(new BigNumber(allowance.toString()))
}

/**
 * Removes `0x` or `0X` from address
 */
export const strip0x = (addr: Address) => addr.replace(/^0(x|X)/, '')
