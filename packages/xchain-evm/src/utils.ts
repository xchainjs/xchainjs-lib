import { Address, BaseAmount, TokenAsset, baseAmount } from '@xchainjs/xchain-util'
import { Signer, Contract, Provider, getAddress, InterfaceAbi, BaseContract } from 'ethers'
import BigNumber from 'bignumber.js'

import erc20ABI from './data/erc20.json'
export const MAX_APPROVAL: BigNumber = new BigNumber(2).pow(256).minus(1)

export const validateAddress = (address: Address): boolean => {
  try {
    getAddress(address)
    return true
  } catch (_error) {
    return false
  }
}

export const getTokenAddress = (asset: TokenAsset): Address | null => {
  try {
    // strip 0X only - 0x is still valid
    return getAddress(asset.symbol.slice(asset.ticker.length + 1).replace(/^0X/, ''))
  } catch (_err) {
    return null
  }
}

export const validateSymbol = (symbol?: string | null): boolean => (symbol ? symbol.length >= 3 : false)

export const getFee = ({
  gasPrice,
  gasLimit,
  decimals,
}: {
  gasPrice: BaseAmount
  gasLimit: BigNumber
  decimals: number
}): BaseAmount => baseAmount(gasPrice.amount().multipliedBy(gasLimit.toString()), decimals)

export const getPrefix = () => '0x'

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
 * If amount is omitted, returns `MAX_APPROVAL`.
 * An explicit amount, including zero, is returned as-is so the allowance can be revoked.
 */
export const getApprovalAmount = (amount?: BaseAmount): BigNumber =>
  amount ? new BigNumber(amount.amount().toFixed()) : MAX_APPROVAL

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
  const estimation = await contract.getFunction(funcName).estimateGas(...funcParams)
  return new BigNumber(estimation.toString())
}

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
  return contract.getFunction(funcName)(...funcParams)
}

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

/** Omitted amount approves the unlimited token allowance. */
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

export async function getAllowance({
  provider,
  contractAddress,
  spenderAddress,
  fromAddress,
}: {
  provider: Provider
  contractAddress: Address
  spenderAddress: Address
  fromAddress: Address
}): Promise<BigNumber> {
  const contract: Contract = new Contract(contractAddress, erc20ABI, provider)
  const allowanceResponse = await contract.allowance(fromAddress, spenderAddress)
  return new BigNumber(allowanceResponse.toString())
}

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
  if (!amount) {
    console.debug('isApproved called without amount, defaulting to 1 base unit check')
  }
  const txAmount = new BigNumber(amount?.amount().toFixed() ?? 1)
  const allowance = await getAllowance({ provider, contractAddress, spenderAddress, fromAddress })

  return txAmount.lte(allowance)
}

export const strip0x = (addr: Address) => addr.replace(/^0(x|X)/, '')

export const getNetworkId = async (provider: Provider): Promise<number> => {
  const network = await provider.getNetwork()
  return Number(network.chainId)
}
