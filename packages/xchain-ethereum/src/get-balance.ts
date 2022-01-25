import { EtherscanProvider } from '@ethersproject/providers'
import { Balance, Balances, Network } from '@thorwallet/xchain-client'
import { Asset, AssetETH, assetToString, baseAmount } from '@thorwallet/xchain-util'
import { BigNumber, BigNumberish, ethers } from 'ethers'
import pThrottle from 'p-throttle'
import erc20ABI from './data/erc20.json'
import * as etherscanAPI from './etherscan-api'
import * as ethplorerAPI from './ethplorer-api'
import { Address } from './types'
import { ETH_DECIMAL, getTokenAddress, getTokenBalances } from './utils'

const call = async <T>({
  contractAddress,
  abi,
  func,
  params,
  provider,
}: {
  contractAddress: Address
  abi: ethers.ContractInterface
  func: string
  params: Array<unknown>
  provider: ethers.providers.BaseProvider
}): Promise<T> => {
  if (!contractAddress) {
    return Promise.reject(new Error('contractAddress must be provided'))
  }
  const contract = new ethers.Contract(contractAddress, abi, provider)
  return contract[func](...params)
}

export const getBalance = async ({
  address,
  network,
  assets,
  ethplorerUrl,
  ethplorerApiKey,
  etherscanApiKey,
  provider,
}: {
  address: Address
  network: Network
  assets?: Asset[]
  ethplorerUrl: string
  ethplorerApiKey: string
  etherscanApiKey: string
  provider: ethers.providers.BaseProvider
}): Promise<Balances> => {
  // get ETH balance directly from provider
  const ethBalance: BigNumber = await provider.getBalance(address)
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
          BigNumber.from(
            await call<BigNumberish>({
              contractAddress: assetAddress,
              abi: erc20ABI,
              func: 'decimals',
              params: [],
              provider,
            }),
          ).toNumber() || ETH_DECIMAL

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
