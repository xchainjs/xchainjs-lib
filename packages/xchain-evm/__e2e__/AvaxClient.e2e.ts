import { Balance, Network, TxType, ExplorerProvider } from '@xchainjs/xchain-client'
import {
  Asset,
  AssetType,
  Chain,
  TokenAsset,
  assetAmount,
  assetToBase,
  assetToString,
  baseAmount,
} from '@xchainjs/xchain-util'

import AvaxClient, {
  ApproveParams,
  EstimateApproveParams,
  EVMKeystoreClientParams,
  IsApprovedParams,
  KeystoreSigner,
} from '../src'
import { EtherscanProviderV2 } from '@xchainjs/xchain-evm-providers'
import { BigNumber } from 'bignumber.js'
import { getAddress, JsonRpcProvider } from 'ethers'

const AVAXChain: Chain = 'AVAX'
const AssetAVAX: Asset = { chain: AVAXChain, symbol: 'AVAX', ticker: 'AVAX', type: AssetType.NATIVE }

// =====Defaults=====
export const transferGasAssetGasLimit: BigNumber = new BigNumber(21000)
export const transferTokenGasLimit: BigNumber = new BigNumber(100000)
// =====Ethers providers=====
const ankrApiKey = process.env.ANKR_API_KEY

// Define JSON-RPC providers for mainnet and testnet
const AVALANCHE_MAINNET_ETHERS_PROVIDER = new JsonRpcProvider(`https://rpc.ankr.com/avalanche/${ankrApiKey}`, {
  name: 'avalanche',
  chainId: 43114,
})
const AVALANCHE_TESTNET_ETHERS_PROVIDER = new JsonRpcProvider(`https://rpc.ankr.com/avalanche_fuji/${ankrApiKey}`, {
  name: 'fuji',
  chainId: 43113,
})

const ethersJSProviders = {
  [Network.Mainnet]: AVALANCHE_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: AVALANCHE_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: AVALANCHE_MAINNET_ETHERS_PROVIDER,
}
// =====Ethers providers=====
// =====ONLINE providers=====
// const API_KEY = 'FAKE_KEY'
const AVAX_ONLINE_PROVIDER_TESTNET = new EtherscanProviderV2(
  AVALANCHE_TESTNET_ETHERS_PROVIDER,
  'https://api.etherscan.io/v2',
  process.env.ETHERSCAN_API_KEY || '',
  AVAXChain,
  AssetAVAX,
  18,
  43113,
)
const AVAX_ONLINE_PROVIDER_MAINNET = new EtherscanProviderV2(
  AVALANCHE_MAINNET_ETHERS_PROVIDER,
  'https://api.etherscan.io/v2',
  process.env.ETHERSCAN_API_KEY || '',
  AVAXChain,
  AssetAVAX,
  18,
  43114,
)

const avaxProviders = {
  [Network.Mainnet]: AVAX_ONLINE_PROVIDER_MAINNET,
  [Network.Testnet]: AVAX_ONLINE_PROVIDER_TESTNET,
  [Network.Stagenet]: AVAX_ONLINE_PROVIDER_MAINNET,
}
// =====ONLINE providers=====

// =====Explorers=====
const AVAX_MAINNET_EXPLORER = new ExplorerProvider(
  'https://snowtrace.io/',
  'https://snowtrace.io/tx/%%TX_ID%%',
  'https://snowtrace.io/address/%%ADDRESS%%',
)
const AVAX_TESTNET_EXPLORER = new ExplorerProvider(
  'https://testnet.snowtrace.io/',
  'https://testnet.snowtrace.io/tx/%%TX_ID%%',
  'https://testnet.snowtrace.io/address/%%ADDRESS%%',
)
const avaxExplorerProviders = {
  [Network.Mainnet]: AVAX_MAINNET_EXPLORER,
  [Network.Testnet]: AVAX_TESTNET_EXPLORER,
  [Network.Stagenet]: AVAX_MAINNET_EXPLORER,
}
// =====Explorers=====

// const avaxRootDerivationPaths = {
//   [Network.Mainnet]: `m/44'/9000'/0'/0/`,
//   [Network.Testnet]: `m/44'/9000'/0'/0/`,
//   [Network.Stagenet]: `m/44'/9000'/0'/0/`,
// }
const ethRootDerivationPaths = {
  [Network.Mainnet]: `m/44'/60'/0'/0/`,
  [Network.Testnet]: `m/44'/60'/0'/0/`,
  [Network.Stagenet]: `m/44'/60'/0'/0/`,
}
const defaults = {
  [Network.Mainnet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(30 * 10 ** 9),
  },
  [Network.Testnet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(30 * 10 ** 9),
  },
  [Network.Stagenet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(30 * 10 ** 9),
  },
}
const avaxParams: EVMKeystoreClientParams = {
  chain: AVAXChain,
  gasAsset: AssetAVAX,
  gasAssetDecimals: 18,
  defaults,
  providers: ethersJSProviders,
  explorerProviders: avaxExplorerProviders,
  dataProviders: [avaxProviders],
  network: Network.Mainnet,
  feeBounds: {
    lower: 1_000_000_000,
    upper: 1_000_000_000_000,
  },
  rootDerivationPaths: ethRootDerivationPaths,
  signer: new KeystoreSigner({
    phrase: process.env.MAINNET_PHRASE as string,
    provider: ethersJSProviders[Network.Mainnet],
    derivationPath: ethRootDerivationPaths[Network.Mainnet],
  }),
}

// import { ApproveParams, EstimateApproveParams, IsApprovedParams } from '../src/types'

// =====Erc-20 asset=====

const assetRIP: TokenAsset = {
  chain: AVAXChain,
  symbol: `RIP-0x224695ba2a98e4a096a519b503336e06d9116e48`,
  ticker: `RIP`,
  type: AssetType.TOKEN,
}

const assetUSDC: TokenAsset = {
  chain: AVAXChain,
  symbol: `USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E`,
  ticker: `USDC`,
  type: AssetType.TOKEN,
}

avaxParams.network = Network.Mainnet
avaxParams.phrase = process.env.MAINNET_PHRASE
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// defaultAvaxParams.dataProviders = [fakeProviders as any, avaxProviders]
const client = new AvaxClient({
  ...avaxParams,
})

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
describe('xchain-evm (Avax) Integration Tests', () => {
  it('should fetch avax balances', async () => {
    const address = '0x09383137C1eEe3E1A8bc781228E4199f6b4A9bbf'
    const balances = await client.getBalance(address)
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should get address', async () => {
    const address = await client.getAddressAsync()
    console.log(address)
  })
  it('should fetch avax txs', async () => {
    const address = '0x55aEd0ce035883626e536254dda2F23a5b5D977f'
    const txPage = await client.getTransactions({ address })
    console.log(JSON.stringify(txPage, null, 2))
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should fetch single avax transfer tx', async () => {
    const txId = '0x4dab51e68d03df97aaf3c8fd9afa3026f6ca7531f79b11a0c0ed39df6d0119e9'
    const tx = await client.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('0.01', 18))
    expect(tx.asset.chain).toBe(AVAXChain)
    expect(tx.asset.ticker).toBe(AssetAVAX.ticker)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe(await client.getAddressAsync(0))
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe(await client.getAddressAsync(1))
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })
  it('should fetch single RIP token transfer tx', async () => {
    const txId = '0x15fa3948bf5c980de8be74afec94b69e6aba1134ed6714aa20fdb6bddb7738f8'
    const tx = await client.getTransactionData(txId, '0x224695Ba2a98E4a096a519B503336E06D9116E48')
    // console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('0.01', 18))
    expect(tx.asset.chain).toBe(assetRIP.chain)
    expect(tx.asset.ticker).toBe(assetRIP.ticker)
    expect(tx.asset.symbol).toBe(assetRIP.symbol)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe(await client.getAddressAsync(0))
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe(await client.getAddressAsync(1))
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })

  it('should transfer 0.01 AVAX between wallet 0 and 1, with a memo', async () => {
    const recipient = await client.getAddressAsync(1)
    const amount = assetToBase(assetAmount('0.01', 18))
    const memo = `=:BNB.BUSD-BD1:bnb1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:100000000000`
    const txHash = await client.transfer({ amount, recipient, memo })
    console.log(txHash)
  })
  it('should transfer 0.01 AVAX following EIP1559 because of maxFeePerGas', async () => {
    const recipient = await client.getAddressAsync(1)
    const amount = assetToBase(assetAmount('0.01', 18))
    const txHash = await client.transfer({
      amount,
      recipient,
      maxFeePerGas: baseAmount('51700000000', 18),
    })
    console.log(txHash)
  })
  it('should transfer 0.01 AVAX following EIP1559 because of maxPriorityFeePerGas', async () => {
    const recipient = await client.getAddressAsync(1)
    const amount = assetToBase(assetAmount('0.01', 18))
    const txHash = await client.transfer({
      amount,
      recipient,
      maxPriorityFeePerGas: baseAmount('1700000000', 18),
    })
    console.log(txHash)
  })
  it('should transfer 0.1 USDC between wallet 0 and 1', async () => {
    const recipient = client.getAddress(1)
    const amount = assetToBase(assetAmount('0.1', 6))
    //ERC20 address The Crypt (RIP)

    const txHash = await client.transfer({ amount, recipient, asset: assetUSDC })
    console.log(txHash)
  })
  it('should transfer 0.01 RIP(ERC-20) between wallet 0 and 1', async () => {
    const recipient = client.getAddress(1)
    const amount = assetToBase(assetAmount('0.01', 18))
    //ERC20 address The Crypt (RIP)

    const txHash = await client.transfer({ amount, recipient, asset: assetRIP })
    console.log(txHash)
  })
  it('should approve 10 USDC tc router', async () => {
    const spender = '0x8F66c4AE756BEbC49Ec8B81966DD8bba9f127549'
    const contractAddress = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'
    const amount = assetToBase(assetAmount('10', 6))
    //ERC20 address The Crypt (RIP)

    const txHash = await client.approve({
      amount,
      contractAddress: contractAddress,
      spenderAddress: spender,
    })
    console.log(txHash)
  })
  it('should approve 0.01 RIP(ERC-20) between wallet 0 and 1', async () => {
    const recipient = await client.getAddressAsync(1)
    const amount = assetToBase(assetAmount('0.01', 6))
    //ERC20 address The Crypt (RIP)

    const txHash = await client.approve({
      amount,
      contractAddress: '0x224695ba2a98e4a096a519b503336e06d9116e48',
      spenderAddress: recipient,
    })
    console.log(txHash)
  })
  it('should test erc-20 approvals ', async () => {
    let isApproved = false
    const params: IsApprovedParams = {
      contractAddress: getAddress('0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'), // USDC
      spenderAddress: '0x8F66c4AE756BEbC49Ec8B81966DD8bba9f127549', // TC router
      amount: assetToBase(assetAmount('1', 6)),
    }
    isApproved = await client.isApproved(params)
    expect(isApproved).toBe(false)

    const approveParams: ApproveParams = {
      contractAddress: getAddress('0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'), // USDC
      spenderAddress: '0x8F66c4AE756BEbC49Ec8B81966DD8bba9f127549', // TC router
      amount: assetToBase(assetAmount('1', 6)),
      walletIndex: 0,
    }
    await client.approve(approveParams)
    await delay(10_000) //wait 10 secs for block to be mined

    isApproved = await client.isApproved(params)
    expect(isApproved).toBe(true)

    approveParams.amount = assetToBase(assetAmount('0.1', 6))
    await client.approve(approveParams)
    await delay(10_000) //wait 10 secs for block to be mined

    isApproved = await client.isApproved(params)
    expect(isApproved).toBe(false)
  })
  it('should test estimates ', async () => {
    const estimateParams: EstimateApproveParams = {
      fromAddress: client.getAddress(0),
      contractAddress: '0x224695Ba2a98E4a096a519B503336E06D9116E48', //ERC20 address The Crypt (RIP)
      spenderAddress: '0x688d21b0b8dc35971af58cff1f7bf65639937860', //PangolinRouter contract on testnet
      amount: assetToBase(assetAmount('1', 18)),
    }
    const gasEstimate = await client.estimateApprove(estimateParams)
    console.log(gasEstimate.toString())
    expect(gasEstimate.gte(0)).toBe(true)

    const recipient = await client.getAddressAsync(1)
    const amount = assetToBase(assetAmount('0.01', 18))
    const memo = '=:BNB.BUSD-BD1:bnb1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:100000000000'
    const gasEstimateWithMemo = await client.estimateFeesWithGasPricesAndLimits({ amount, recipient, memo })
    const gasEstimateWithoutMemo = await client.estimateFeesWithGasPricesAndLimits({ amount, recipient })
    expect(gasEstimateWithMemo.gasLimit.gte(gasEstimateWithoutMemo.gasLimit)).toBe(true)
    expect(gasEstimateWithMemo.fees.average.gte(gasEstimateWithoutMemo.fees.average)).toBe(true)

    const gasPrices = await client.estimateGasPrices()
    expect(gasPrices.fast.gte(gasPrices.average)).toBe(true)
    expect(gasPrices.fastest.gte(gasPrices.average)).toBe(true)
    expect(gasPrices.fastest.gte(gasPrices.fast)).toBe(true)
  })

  it('calls balanceOf on ERC20 contract and returns the result', async () => {
    const tokenAddress = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'
    const walletAddress = await client.getAddressAsync(1)
    console.log(walletAddress)

    const ERC20_ABI = [
      {
        constant: true,
        inputs: [{ name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
      },
    ]

    const params = {
      contractAddress: tokenAddress,
      abi: ERC20_ABI,
      funcName: 'balanceOf',
      funcParams: [walletAddress],
      signer: undefined,
    }

    const result = await client.call<bigint>(params)

    console.log(result)
  })

  it('should estimate gas for ERC20 transfer', async () => {
    const asset = assetUSDC
    const amount = assetToBase(assetAmount(1, 6))

    const recipient = await client.getAddressAsync(1)

    const gas = await client.estimateGasLimit({
      asset,
      recipient: recipient,
      amount,
    })

    console.log(gas.toString())
  })
})
