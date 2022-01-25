import { Balance, Balances, Network } from '@thorwallet/xchain-client'
import { Asset, AssetETH, assetToString, baseAmount } from '@thorwallet/xchain-util'
import { BigNumber, BigNumberish, ethers } from 'ethers'
import pThrottle from 'p-throttle'
import { Address } from './types'
import { ETH_DECIMAL, getTokenAddress, getTokenBalances } from './utils'
import * as ethplorerAPI from './ethplorer-api'
import * as etherscanAPI from './etherscan-api'
import erc20ABI from './data/erc20.json'
import { EtherscanProvider, getDefaultProvider } from '@ethersproject/providers'

const getProvider = (network: Network) => {
  return getDefaultProvider(network)
}

const call = async <T>(
  network: Network,
  contractAddress: Address,
  abi: ethers.ContractInterface,
  func: string,
  params: Array<unknown>,
): Promise<T> => {
  if (!contractAddress) {
    return Promise.reject(new Error('contractAddress must be provided'))
  }
  const contract = new ethers.Contract(contractAddress, abi, getProvider(network))
  return contract[func](...params)
}

export const getBalance = async ({
  address,
  network,
  assets,
  ethplorerUrl,
  ethplorerApiKey,
  etherscanApiKey,
}: {
  address: Address
  network: Network
  assets?: Asset[]
  ethplorerUrl: string
  ethplorerApiKey: string
  etherscanApiKey: string
}): Promise<Balances> => {
  // get ETH balance directly from provider
  const ethBalance: BigNumber = await getProvider(network).getBalance(address)
  const ethBalanceAmount = baseAmount(ethBalance.toString(), ETH_DECIMAL)

  if (network === 'mainnet') {
    // use ethplorerAPI for mainnet - ignore assets
    const account = await ethplorerAPI.getAddress(ethplorerUrl, address, ethplorerApiKey)
    const balances: Balances = [
      {
        asset: AssetETH,
        amount: ethBalanceAmount,
      },
    ]

    if (account.tokens) {
      balances.push(...getTokenBalances(account.tokens))
    }

    return balances
  }
  // use etherscan for testnet

  const newAssets = assets || [AssetETH]
  // Follow approach is only for testnet
  // For mainnet, we will use ethplorer api(one request only)
  // https://github.com/xchainjs/xchainjs-lib/issues/252
  // And to avoid etherscan api call limit, it gets balances in a sequence way, not in parallel

  const throttle = pThrottle({
    limit: 5,
    interval: 1000,
  })

  const getBalance = throttle(
    async (asset: Asset): Promise<Balance> => {
      const etherscan = new EtherscanProvider(network, etherscanApiKey)

      if (assetToString(asset) !== assetToString(AssetETH)) {
        // Handle token balances
        const assetAddress = getTokenAddress(asset)
        if (!assetAddress) {
          throw new Error(`Invalid asset ${asset}`)
        }
        const balance = await etherscanAPI.getTokenBalance({
          baseUrl: etherscan.baseUrl,
          address,
          assetAddress,
          apiKey: etherscan.apiKey,
        })
        const decimals =
          BigNumber.from(await call<BigNumberish>(network, assetAddress, erc20ABI, 'decimals', [])).toNumber() ||
          ETH_DECIMAL

        if (!Number.isNaN(decimals)) {
          return {
            asset,
            amount: baseAmount(balance.toString(), decimals),
          }
        }
      }
      return {
        asset: AssetETH,
        amount: ethBalanceAmount,
      }
    },
  )

  const balances = await Promise.all(newAssets.map((asset) => getBalance(asset)))

  return balances
}
