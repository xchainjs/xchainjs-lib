import { Address, Balance, FeeType, Fees, Network, TxHash, TxType, singleFee } from '@xchainjs/xchain-client'
import { CosmosSDKClient, TxLog } from '@xchainjs/xchain-cosmos'
import {
  Asset,
  AssetRuneNative,
  BaseAmount,
  Chain,
  assetFromString,
  assetToString,
  baseAmount,
} from '@xchainjs/xchain-util'
import axios from 'axios'
import { AccAddress, Msg, codec } from 'cosmos-client'
import { StdTxFee } from 'cosmos-client/api'
import { StdTx } from 'cosmos-client/x/auth'
import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank'

import { ClientUrl, ExplorerUrl, ExplorerUrls, TxData } from './types'
import { MsgNativeTx, ThorchainDepositResponse, ThorchainNodeInfoResponse } from './types/messages'

export const DECIMAL = 8
export const DEFAULT_GAS_VALUE = '2000000'
export const DEPOSIT_GAS_VALUE = '500000000'
export const MAX_TX_COUNT = 100

/**
 * Get denomination from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denomination of the given asset.
 */
export const getDenom = (asset: Asset): string => {
  if (assetToString(asset) === assetToString(AssetRuneNative)) return 'rune'
  return asset.symbol
}

/**
 * Get denomination with chainname from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denomination with chainname of the given asset.
 */
export const getDenomWithChain = (asset: Asset): string => {
  return `${Chain.THORChain}.${asset.symbol.toUpperCase()}`
}

/**
 * Get Asset from denomination
 *
 * @param {string} denom
 * @returns {Asset|null} The asset of the given denomination.
 */
export const getAsset = (denom: string): Asset | null => {
  if (denom === getDenom(AssetRuneNative)) return AssetRuneNative
  return assetFromString(`${Chain.THORChain}.${denom.toUpperCase()}`)
}

/**
 * Type guard for MsgSend
 *
 * @param {Msg} msg
 * @returns {boolean} `true` or `false`.
 */
export const isMsgSend = (msg: Msg): msg is MsgSend =>
  (msg as MsgSend)?.amount !== undefined &&
  (msg as MsgSend)?.from_address !== undefined &&
  (msg as MsgSend)?.to_address !== undefined

/**
 * Type guard for MsgMultiSend
 *
 * @param {Msg} msg
 * @returns {boolean} `true` or `false`.
 */
export const isMsgMultiSend = (msg: Msg): msg is MsgMultiSend =>
  (msg as MsgMultiSend)?.inputs !== undefined && (msg as MsgMultiSend)?.outputs !== undefined

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
 * Get the chain id.
 *
 * @param {Network} network
 * @returns {string} The chain id based on the network.
 * 
 */
 export const getChainId = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
      return 'thorchain'
    case Network.Stagenet:
      return 'thorchain-stagenet'
    case Network.Testnet:
      return 'thorchain'
  }
}

/**
 * Register Codecs based on the prefix.
 *
 * @param {string} prefix
 */
export const registerCodecs = (prefix: string): void => {
  codec.registerCodec('thorchain/MsgSend', MsgSend, MsgSend.fromJSON)
  codec.registerCodec('thorchain/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)

  AccAddress.setBech32Prefix(
    prefix,
    prefix + 'pub',
    prefix + 'valoper',
    prefix + 'valoperpub',
    prefix + 'valcons',
    prefix + 'valconspub',
  )
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
        from: [...acc.from, { amount, from: sender }],
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
  const fee = baseAmount(DEFAULT_GAS_VALUE, DECIMAL)
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
 * Structure StdTx from MsgNativeTx.
 *
 * @param {string} txId The transaction id.
 * @returns {Tx} The transaction details of the given transaction id.
 *
 * @throws {"Invalid client url"} Thrown if the client url is an invalid one.
 */
export const buildDepositTx = async (msgNativeTx: MsgNativeTx, nodeUrl: string): Promise<StdTx> => {
  const nodeInfo: ThorchainNodeInfoResponse = (
      await axios.get(`${nodeUrl}/cosmos/base/tendermint/v1beta1/node_info`)
  ).data
  const chainId = nodeInfo.default_node_info.network
  if (!chainId || !(chainId == "thorchain" || chainId == "thorchain-stagenet" )) throw new Error("invalid network")
  
  const response: ThorchainDepositResponse = (
    await axios.post(`${nodeUrl}/thorchain/deposit`, {
      coins: msgNativeTx.coins,
      memo: msgNativeTx.memo,
      base_req: {
        chain_id: chainId,
        from: msgNativeTx.signer,
      },
    })
  ).data

  if (!response || !response.value) throw new Error('Invalid client url')

  const fee: StdTxFee = response.value?.fee ?? { amount: [] }

  const unsignedStdTx = StdTx.fromJSON({
    msg: response.value.msg,
    // override fee
    fee: { ...fee, gas: DEPOSIT_GAS_VALUE },
    signatures: [],
    memo: '',
  })

  return unsignedStdTx
}

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
      asset: (balance.denom && getAsset(balance.denom)) || AssetRuneNative,
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
