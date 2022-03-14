import { codec } from '@cosmos-client/core/cjs/types/codec'
import { Address, Balance, FeeType, Fees, Network, TxHash, TxType, singleFee } from '@xchainjs/xchain-client'
import { CosmosSDKClient, TxLog } from '@xchainjs/xchain-cosmos'
import {
  Asset,
  AssetRuneNative,
  BaseAmount,
  assetAmount,
  assetFromString,
  assetToBase,
  assetToString,
  baseAmount,
  isSynthAsset,
} from '@xchainjs/xchain-util'
import axios from 'axios'
import { ChainId, ChainIds, ClientUrl, ExplorerUrl, ExplorerUrls, NodeInfoResponse, TxData } from './types'
import types from './types/proto/MsgDeposit'

export const DECIMAL = 8
export const DEFAULT_GAS_VALUE = '3000000'
export const DEPOSIT_GAS_VALUE = '500000000'
export const MAX_TX_COUNT = 100

/**
 * Checks whether an asset is `AssetRuneNative`
 *
 * @param {Asset} asset
 * @returns {boolean} `true` or `false`
 */
export const isAssetRuneNative = (asset: Asset): boolean => assetToString(asset) === assetToString(AssetRuneNative)

const DENOM_RUNE_NATIVE = 'rune'
/**
 * Get denomination from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denomination of the given asset.
 */
export const getDenom = (asset: Asset): string => {
  if (isAssetRuneNative(asset)) return DENOM_RUNE_NATIVE
  if (isSynthAsset(asset)) return assetToString(asset).toLowerCase()
  return asset.symbol.toLowerCase()
}

/**
 * Get Asset from denomination
 *
 * @param {string} denom
 * @returns {Asset|null} The asset of the given denomination.
 */
export const assetFromDenom = (denom: string): Asset | null => {
  if (denom === DENOM_RUNE_NATIVE) return AssetRuneNative
  return assetFromString(denom.toUpperCase())
}

// /**
//  * Type guard for MsgSend
//  *
//  * @param {Msg} msg
//  * @returns {boolean} `true` or `false`.
//  */
// export const isMsgSend = (msg: Msg): msg is MsgSend =>
//   (msg as MsgSend)?.amount !== undefined &&
//   (msg as MsgSend)?.from_address !== undefined &&
//   (msg as MsgSend)?.to_address !== undefined

// /**
//  * Type guard for MsgMultiSend
//  *
//  * @param {Msg} msg
//  * @returns {boolean} `true` or `false`.
//  */
// export const isMsgMultiSend = (msg: Msg): msg is MsgMultiSend =>
//   (msg as MsgMultiSend)?.inputs !== undefined && (msg as MsgMultiSend)?.outputs !== undefined

/**
 * Response guard for transaction broadcast
 *
 * @param {any} response The response from the node.
 * @returns {boolean} `true` or `false`.
 */
export const isBroadcastSuccess = (response: unknown): boolean =>
  typeof response === 'object' &&
  response !== null &&
  'logs' in response &&
  (response as Record<string, unknown>).logs !== undefined

/**
 * Get address prefix based on the network.
 *
 * @param {Network} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
      return 'thor'
    case Network.Stagenet:
      return 'sthor'
    case Network.Testnet:
      return 'tthor'
  }
}

/**
 * Register Codecs based on the prefix.
 *
 * @param {string} prefix
 */
export const registerCodecs = async (): Promise<void> => {
  codec.register('/types.MsgDeposit', types.types.MsgDeposit)
}

/**
 * Parse transaction data from event logs
 *
 * @param {TxLog[]} logs List of tx logs
 * @param {Address} address - Address to get transaction data for
 * @returns {TxData} Parsed transaction data
 */
export const getDepositTxDataFromLogs = (logs: TxLog[], address: Address): TxData => {
  const events = logs[0]?.events

  if (!events) {
    throw Error('No events in logs available')
  }

  type TransferData = { sender: string; recipient: string; amount: BaseAmount }
  type TransferDataList = TransferData[]
  const transferDataList: TransferDataList = events.reduce((acc: TransferDataList, { type, attributes }) => {
    if (type === 'transfer') {
      return attributes.reduce((acc2, { key, value }, index) => {
        if (index % 3 === 0) acc2.push({ sender: '', recipient: '', amount: baseAmount(0, DECIMAL) })
        const newData = acc2[acc2.length - 1]
        if (key === 'sender') newData.sender = value
        if (key === 'recipient') newData.recipient = value
        if (key === 'amount') newData.amount = baseAmount(value.replace(/rune/, ''), DECIMAL)
        return acc2
      }, acc)
    }
    return acc
  }, [])

  const txData: TxData = transferDataList
    // filter out txs which are not based on given address
    .filter(({ sender, recipient }) => sender === address || recipient === address)
    // transform `TransferData` -> `TxData`
    .reduce(
      (acc: TxData, { sender, recipient, amount }) => ({
        ...acc,
        from: [...acc, { amount, from: sender }],
        to: [...acc.to, { amount, to: recipient }],
      }),
      { from: [], to: [], type: TxType.Transfer },
    )

  return txData
}

/**
 * Get the default fee.
 *
 * @returns {Fees} The default fee.
 */
export const getDefaultFees = (): Fees => {
  const fee = assetToBase(assetAmount(0.02 /* 0.02 RUNE */, DECIMAL))
  return singleFee(FeeType.FlatFee, fee)
}

/**
 * Get transaction type.
 *
 * @param {string} txData the transaction input data
 * @param {string} encoding `base64` or `hex`
 * @returns {string} the transaction type.
 */
export const getTxType = (txData: string, encoding: 'base64' | 'hex'): string => {
  return Buffer.from(txData, encoding).toString().slice(4)
}

/**
 * Helper to get THORChain's chain id
 * @param {string} nodeUrl THORNode url
 */
export const getChainId = async (nodeUrl: string): Promise<ChainId> => {
  const { data } = await axios.get<NodeInfoResponse>(`${nodeUrl}/cosmos/base/tendermint/v1beta1/node_info`)
  return data?.default_node_info?.network || Promise.reject('Could not parse chain id')
}

/**
 * Helper to get all THORChain's chain id
 * @param {ClientUrl} client urls (use `getDefaultClientUrl()` if you don't need to use custom urls)
 */
export const getChainIds = async (client: ClientUrl): Promise<ChainIds> => {
  return Promise.all([
    getChainId(client[Network.Testnet].node),
    getChainId(client[Network.Stagenet].node),
    getChainId(client[Network.Mainnet].node),
  ]).then(([testnetId, stagenetId, mainnetId]) => ({
    testnet: testnetId,
    stagenet: stagenetId,
    mainnet: mainnetId,
  }))
}

// /**
//  * Structure StdTx from MsgNativeTx.
//  *
//  * @param {MsgNativeTx} msgNativeTx Msg of type `MsgNativeTx`.
//  * @param {string} nodeUrl Node url
//  * @param {chainId} ChainId Chain id of the network
//  *
//  * @returns {Tx} The transaction details of the given transaction id.
//  *
//  * @throws {"Invalid client url"} Thrown if the client url is an invalid one.
//  */
// export const buildDepositTx = async ({
//   msgNativeTx,
//   nodeUrl,
//   chainId,
// }: {
//   msgNativeTx: MsgNativeTx
//   nodeUrl: string
//   chainId: ChainId
// }): Promise<StdTx> => {
//   const networkChainId = await getChainId(nodeUrl)
//   if (!networkChainId || chainId !== networkChainId)
//     throw new Error(`Invalid network (asked: ${chainId} / returned: ${networkChainId}`)

//   const response: ThorchainDepositResponse = (
//     await axios.post(`${nodeUrl}/thorchain/deposit`, {
//       coins: msgNativeTx.coins,
//       memo: msgNativeTx.memo,
//       base_req: {
//         chain_id: chainId,
//         from: msgNativeTx.signer,
//       },
//     })
//   ).data

//   if (!response || !response.value) throw new Error('Invalid client url')

//   const fee: StdTxFee = response.value?.fee ?? { amount: [] }

//   const unsignedStdTx = StdTx.fromJSON({
//     msg: response.value.msg,
//     // override fee
//     fee: { ...fee, gas: DEPOSIT_GAS_VALUE },
//     signatures: [],
//     memo: '',
//   })

//   return unsignedStdTx
// }

/**
 * Get the balance of a given address.
 *
 * @param {Address} address By default, it will return the balance of the current wallet. (optional)
 * @param {Asset} asset If not set, it will return all assets available. (optional)
 * @param {cosmosClient} CosmosSDKClient
 *
 * @returns {Balance[]} The balance of the address.
 */
export const getBalance = async ({
  address,
  assets,
  cosmosClient,
}: {
  address: Address
  assets?: Asset[]
  cosmosClient: CosmosSDKClient
}): Promise<Balance[]> => {
  const balances = await cosmosClient.getBalance(address)
  return balances
    .map((balance) => ({
      asset: (balance.denom && assetFromDenom(balance.denom)) || AssetRuneNative,
      amount: baseAmount(balance.amount, DECIMAL),
    }))
    .filter(
      (balance) => !assets || assets.filter((asset) => assetToString(balance.asset) === assetToString(asset)).length,
    )
}

/**
 * Get the client url.
 *
 * @returns {ClientUrl} The client url (both mainnet and testnet) for thorchain.
 */
export const getDefaultClientUrl = (): ClientUrl => {
  return {
    [Network.Testnet]: {
      node: 'https://testnet.thornode.thorchain.info',
      rpc: 'https://testnet.rpc.thorchain.info',
    },
    [Network.Stagenet]: {
      node: 'https://stagenet-thornode.ninerealms.com',
      rpc: 'https://stagenet-rpc.ninerealms.com',
    },
    [Network.Mainnet]: {
      node: 'https://thornode.ninerealms.com',
      rpc: 'https://rpc.thorchain.info',
    },
  }
}

const DEFAULT_EXPLORER_URL = 'https://viewblock.io/thorchain'

/**
 * Get default explorer urls.
 *
 * @returns {ExplorerUrls} Default explorer urls (both mainnet and testnet) for thorchain.
 */
export const getDefaultExplorerUrls = (): ExplorerUrls => {
  const root: ExplorerUrl = {
    [Network.Testnet]: `${DEFAULT_EXPLORER_URL}?network=testnet`,
    [Network.Stagenet]: `${DEFAULT_EXPLORER_URL}?network=stagenet`,
    [Network.Mainnet]: DEFAULT_EXPLORER_URL,
  }
  const txUrl = `${DEFAULT_EXPLORER_URL}/tx`
  const tx: ExplorerUrl = {
    [Network.Testnet]: txUrl,
    [Network.Stagenet]: txUrl,
    [Network.Mainnet]: txUrl,
  }
  const addressUrl = `${DEFAULT_EXPLORER_URL}/address`
  const address: ExplorerUrl = {
    [Network.Testnet]: addressUrl,
    [Network.Stagenet]: addressUrl,
    [Network.Mainnet]: addressUrl,
  }

  return {
    root,
    tx,
    address,
  }
}

/**
 * Get the explorer url.
 *
 * @param {Network} network
 * @param {ExplorerUrls} Explorer urls
 * @returns {string} The explorer url for thorchain based on the given network.
 */
export const getExplorerUrl = ({ root }: ExplorerUrls, network: Network): string => root[network]

/**
 * Get explorer address url.
 *
 * @param {ExplorerUrls} Explorer urls
 * @param {Network} network
 * @param {Address} address
 * @returns {string} The explorer url for the given address.
 */
export const getExplorerAddressUrl = ({
  urls,
  network,
  address,
}: {
  urls: ExplorerUrls
  network: Network
  address: Address
}): string => {
  const url = `${urls.address[network]}/${address}`
  switch (network) {
    case Network.Mainnet:
      return url
    case Network.Stagenet:
      return `${url}?network=stagenet`
    case Network.Testnet:
      return `${url}?network=testnet`
  }
}

/**
 * Get transaction url.
 *
 * @param {ExplorerUrls} Explorer urls
 * @param {Network} network
 * @param {TxHash} txID
 * @returns {string} The explorer url for the given transaction id.
 */
export const getExplorerTxUrl = ({
  urls,
  network,
  txID,
}: {
  urls: ExplorerUrls
  network: Network
  txID: TxHash
}): string => {
  const url = `${urls.tx[network]}/${txID}`
  switch (network) {
    case Network.Mainnet:
      return url
    case Network.Stagenet:
      return `${url}?network=stagenet`
    case Network.Testnet:
      return `${url}?network=testnet`
  }
}
