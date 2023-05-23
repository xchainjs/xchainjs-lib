import { Balance, FeeType, Fees, Network, Tx, TxType } from '@xchainjs/xchain-client'
import {
  Address,
  Asset,
  BaseAmount,
  assetAmount,
  assetFromString,
  assetToBase,
  assetToString,
  baseAmount,
  eqAsset,
} from '@xchainjs/xchain-util'
import { Signer, ethers, providers } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

import {
  AssetETH,
  BASE_TOKEN_GAS_COST,
  DEFAULT_GAS_PRICE,
  ETHAddress,
  ETHChain,
  ETH_DECIMAL,
  MAX_APPROVAL,
  SIMPLE_GAS_COST,
} from './const'
import erc20ABI from './data/erc20.json'
import {
  ETHTransactionInfo,
  EthNetwork,
  FeesWithGasPricesAndLimits,
  GasPrices,
  TokenBalance,
  TokenTransactionInfo,
  TransactionInfo,
  TransactionOperation,
} from './types'

/**
 * Network -> EthNetwork
 *
 * @param {Network} network
 * @returns {EthNetwork}
 */
export const xchainNetworkToEths = (network: Network): EthNetwork => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return EthNetwork.Main
    case Network.Testnet:
      return EthNetwork.Test
  }
}

/**
 * EthNetwork -> Network
 *
 * @param {EthNetwork} network
 * @returns {Network}
 */
export const ethNetworkToXchains = (network: EthNetwork): Network => {
  switch (network) {
    case EthNetwork.Main:
      return Network.Mainnet
    case EthNetwork.Test:
      return Network.Testnet
  }
}

/**
 * Validate the given address.
 *
 * @param {Address} address
 * @returns {boolean} `true` or `false`
 */
export const validateAddress = (address: Address): boolean => {
  try {
    ethers.utils.getAddress(address)
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
    return ethers.utils.getAddress(asset.symbol.slice(asset.ticker.length + 1).replace(/^0X/, ''))
  } catch (err) {
    return null
  }
}

/**
 * Checks whether an `Asset` is `AssetETH` or not
 *
 * @param {Asset} asset
 * @returns {boolean} Result of check if an asset is ETH or not
 */
export const isEthAsset = (asset: Asset): boolean => eqAsset(AssetETH, asset)

/**
 * Parses asset address from `Asset`
 *
 * @param {Asset} asset
 * @returns {Address|null} Asset address
 */
export const getAssetAddress = (asset: Asset): Address | null => {
  if (isEthAsset(asset)) return ETHAddress

  return getTokenAddress(asset)
}

/**
 * Check if the symbol is valid.
 *
 * @param {string|null|undefined} symbol
 * @returns {boolean} `true` or `false`.
 */
export const validateSymbol = (symbol?: string | null): boolean => (symbol ? symbol.length >= 3 : false)

/**
 * Get transactions from token tx
 *
 * @param {TokenTransactionInfo} tx
 * @returns {Tx|null} The parsed transaction.
 */
export const getTxFromTokenTransaction = (tx: TokenTransactionInfo): Tx | null => {
  const decimals = parseInt(tx.tokenDecimal) || ETH_DECIMAL
  const symbol = tx.tokenSymbol
  const address = tx.contractAddress
  if (validateSymbol(symbol) && validateAddress(address)) {
    const tokenAsset = assetFromString(`${ETHChain}.${symbol}-${address}`)
    if (tokenAsset) {
      return {
        asset: tokenAsset,
        from: [
          {
            from: tx.from,
            amount: baseAmount(tx.value, decimals),
          },
        ],
        to: [
          {
            to: tx.to,
            amount: baseAmount(tx.value, decimals),
          },
        ],
        date: new Date(parseInt(tx.timeStamp) * 1000),
        type: TxType.Transfer,
        hash: tx.hash,
      }
    }
  }

  return null
}

/**
 * Get transactions from ETH transaction
 *
 * @param {ETHTransactionInfo} tx
 * @returns {Tx} The parsed transaction.
 */
export const getTxFromEthTransaction = (tx: ETHTransactionInfo): Tx => {
  return {
    asset: AssetETH,
    from: [
      {
        from: tx.from,
        amount: baseAmount(tx.value, ETH_DECIMAL),
      },
    ],
    to: [
      {
        to: tx.to,
        amount: baseAmount(tx.value, ETH_DECIMAL),
      },
    ],
    date: new Date(parseInt(tx.timeStamp) * 1000),
    type: TxType.Transfer,
    hash: tx.hash,
  }
}

/**
 * Get transactions from operation
 *
 * @param {TransactionOperation} operation
 * @returns {Tx|null} The parsed transaction.
 */
export const getTxFromEthplorerTokenOperation = (operation: TransactionOperation): Tx | null => {
  const decimals = parseInt(operation.tokenInfo.decimals) || ETH_DECIMAL
  const { symbol, address } = operation.tokenInfo
  if (validateSymbol(symbol) && validateAddress(address)) {
    const tokenAsset = assetFromString(`${ETHChain}.${symbol}-${address}`)
    if (tokenAsset) {
      return {
        asset: tokenAsset,
        from: [
          {
            from: operation.from,
            amount: baseAmount(operation.value, decimals),
          },
        ],
        to: [
          {
            to: operation.to,
            amount: baseAmount(operation.value, decimals),
          },
        ],
        date: new Date(operation.timestamp * 1000),
        type: operation.type === 'transfer' ? TxType.Transfer : TxType.Unknown,
        hash: operation.transactionHash,
      }
    }
  }

  return null
}

/**
 * Get transactions from ETH transaction
 *
 * @param {TransactionInfo} txInfo
 * @returns {Tx} The parsed transaction.
 */
export const getTxFromEthplorerEthTransaction = (txInfo: TransactionInfo): Tx => {
  return {
    asset: AssetETH,
    from: [
      {
        from: txInfo.from,
        amount: assetToBase(assetAmount(txInfo.value, ETH_DECIMAL)),
      },
    ],
    to: [
      {
        to: txInfo.to,
        amount: assetToBase(assetAmount(txInfo.value, ETH_DECIMAL)),
      },
    ],
    date: new Date(txInfo.timestamp * 1000),
    type: TxType.Transfer,
    hash: txInfo.hash,
  }
}

/**
 * Calculate fees by multiplying .
 *
 * @returns {Fees} The default gas price.
 */
export const getFee = ({ gasPrice, gasLimit }: { gasPrice: BaseAmount; gasLimit: ethers.BigNumber }) =>
  baseAmount(gasPrice.amount().multipliedBy(gasLimit.toString()), ETH_DECIMAL)

export const estimateDefaultFeesWithGasPricesAndLimits = (asset?: Asset): FeesWithGasPricesAndLimits => {
  const gasPrices = {
    average: baseAmount(parseUnits(DEFAULT_GAS_PRICE.toString(), 'gwei').toString(), ETH_DECIMAL),
    fast: baseAmount(parseUnits((DEFAULT_GAS_PRICE * 2).toString(), 'gwei').toString(), ETH_DECIMAL),
    fastest: baseAmount(parseUnits((DEFAULT_GAS_PRICE * 3).toString(), 'gwei').toString(), ETH_DECIMAL),
  }
  const { fast: fastGP, fastest: fastestGP, average: averageGP } = gasPrices

  let assetAddress
  if (asset && assetToString(asset) !== assetToString(AssetETH)) {
    assetAddress = getTokenAddress(asset)
  }

  let gasLimit
  if (assetAddress && assetAddress !== ETHAddress) {
    gasLimit = ethers.BigNumber.from(BASE_TOKEN_GAS_COST)
  } else {
    gasLimit = ethers.BigNumber.from(SIMPLE_GAS_COST)
  }

  return {
    gasPrices,
    gasLimit,
    fees: {
      type: FeeType.PerByte,
      average: getFee({ gasPrice: averageGP, gasLimit }),
      fast: getFee({ gasPrice: fastGP, gasLimit }),
      fastest: getFee({ gasPrice: fastestGP, gasLimit }),
    },
  }
}

/**
 * Get the default fees.
 *
 * @returns {Fees} The default gas price.
 */
export const getDefaultFees = (asset?: Asset): Fees => {
  const { fees } = estimateDefaultFeesWithGasPricesAndLimits(asset)
  return fees
}

/**
 * Get the default gas price.
 *
 * @returns {Fees} The default gas prices.
 */
export const getDefaultGasPrices = (asset?: Asset): GasPrices => {
  const { gasPrices } = estimateDefaultFeesWithGasPricesAndLimits(asset)
  return gasPrices
}

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
export const getApprovalAmount = (amount?: BaseAmount): ethers.BigNumber =>
  amount && amount.gt(baseAmount(0, amount.decimal)) ? ethers.BigNumber.from(amount.amount().toFixed()) : MAX_APPROVAL

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
  provider: providers.Provider
  contractAddress: Address
  abi: ethers.ContractInterface
  funcName: string
  funcParams?: unknown[]
}): Promise<ethers.BigNumber> => {
  const contract: ethers.Contract = new ethers.Contract(contractAddress, abi, provider)
  return await contract.estimateGas[funcName](...funcParams)
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
  provider: providers.Provider
  signer?: Signer
  contractAddress: Address
  abi: ethers.ContractInterface
  funcName: string
  funcParams?: unknown[]
}): Promise<T> => {
  let contract = new ethers.Contract(contractAddress, abi, provider)
  if (signer) {
    // For sending transactions a signer is needed
    contract = contract.connect(signer)
  }
  return contract[funcName](...funcParams)
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
export const estimateApprove = async ({
  provider,
  contractAddress,
  spenderAddress,
  fromAddress,
  abi,
  amount,
}: {
  provider: providers.Provider
  contractAddress: Address
  spenderAddress: Address
  fromAddress: Address
  abi: ethers.ContractInterface
  amount?: BaseAmount
}): Promise<ethers.BigNumber> => {
  const txAmount = getApprovalAmount(amount)
  return await estimateCall({
    provider,
    contractAddress,
    abi,
    funcName: 'approve',
    funcParams: [spenderAddress, txAmount, { from: fromAddress }],
  })
}

/**
 * Get Decimals
 *
 * @param {Asset} asset
 * @returns {Number} the decimal of a given asset
 *
 * @throws {"Invalid asset"} Thrown if the given asset is invalid
 */
export const getDecimal = async (asset: Asset, provider: providers.Provider): Promise<number> => {
  if (assetToString(asset) === assetToString(AssetETH)) return ETH_DECIMAL

  const assetAddress = getTokenAddress(asset)
  if (!assetAddress) throw new Error(`Invalid asset ${assetToString(asset)}`)

  const contract: ethers.Contract = new ethers.Contract(assetAddress, erc20ABI, provider)
  const decimal: ethers.BigNumberish = await contract.decimals()

  return ethers.BigNumber.from(decimal).toNumber()
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
export const isApproved = async ({
  provider,
  contractAddress,
  spenderAddress,
  fromAddress,
  amount,
}: {
  provider: providers.Provider
  contractAddress: Address
  spenderAddress: Address
  fromAddress: Address
  amount?: BaseAmount
}): Promise<boolean> => {
  const txAmount = ethers.BigNumber.from(amount?.amount().toFixed() ?? 1)
  const contract: ethers.Contract = new ethers.Contract(contractAddress, erc20ABI, provider)
  const allowance: ethers.BigNumberish = await contract.allowance(fromAddress, spenderAddress)

  return txAmount.lte(allowance)
}

/**
 * Get Token Balances
 *
 * @param {TokenBalance[]} tokenBalances
 * @returns {Balance[]} the parsed balances
 *
 */
export const getTokenBalances = (tokenBalances: TokenBalance[]): Balance[] => {
  return tokenBalances.reduce((acc, cur) => {
    const { symbol, address: tokenAddress } = cur.tokenInfo
    if (validateSymbol(symbol) && validateAddress(tokenAddress) && cur?.tokenInfo?.decimals !== undefined) {
      const decimals = parseInt(cur.tokenInfo.decimals, 10)
      const tokenAsset = assetFromString(`${ETHChain}.${symbol}-${ethers.utils.getAddress(tokenAddress)}`)
      if (tokenAsset) {
        return [
          ...acc,
          {
            asset: tokenAsset,
            amount: baseAmount(cur.balance, decimals),
          },
        ]
      }
    }

    return acc
  }, [] as Balance[])
}
