import { Asset, assetToString, baseAmount, assetFromString, THORChain } from '@xchainjs/xchain-util'
import { AssetRune, ExplorerUrl, ClientUrl, ExplorerUrls, TxData } from './types'
import { TxResponse, RawTxResponse, TxLog } from '@xchainjs/xchain-cosmos'
import { TxFrom, TxTo, Fees, Network, Address, TxHash } from '@xchainjs/xchain-client'
import { AccAddress, codec, Msg } from 'cosmos-client'
import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank'
import { StdTx } from 'cosmos-client/x/auth'

export const DECIMAL = 8
export const DEFAULT_GAS_VALUE = '2000000'
export const MAX_TX_COUNT = 100

/**
 * Get denomination from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denomination of the given asset.
 */
export const getDenom = (asset: Asset): string => {
  if (assetToString(asset) === assetToString(AssetRune)) return 'rune'
  return asset.symbol
}

/**
 * Get denomination with chainname from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denomination with chainname of the given asset.
 */
export const getDenomWithChain = (asset: Asset): string => {
  return `${THORChain}.${asset.symbol.toUpperCase()}`
}

/**
 * Get Asset from denomination
 *
 * @param {string} denom
 * @returns {Asset|null} The asset of the given denomination.
 */
export const getAsset = (denom: string): Asset | null => {
  if (denom === getDenom(AssetRune)) return AssetRune
  return assetFromString(`${THORChain}.${denom.toUpperCase()}`)
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isBroadcastSuccess = (response: any): boolean => response.logs !== undefined

/**
 * Get address prefix based on the network.
 *
 * @param {string} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = (network: string) => (network === 'testnet' ? 'tthor' : 'thor')

/**
 * Register Codecs based on the network.
 *
 * @param {Network}
 */
export const registerCodecs = (network: Network): void => {
  codec.registerCodec('thorchain/MsgSend', MsgSend, MsgSend.fromJSON)
  codec.registerCodec('thorchain/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)

  const prefix = getPrefix(network)
  AccAddress.setBech32Prefix(
    prefix,
    prefix + 'pub',
    prefix + 'valoper',
    prefix + 'valoperpub',
    prefix + 'valcons',
    prefix + 'valconspub',
  )
}

export const getDepositTxDataFromLogs = (logs: TxLog[]): TxData => {
  const events = logs[0]?.events

  if (!events) {
    throw Error('No events in logs available')
  }

  let data = { sender: '', recipient: '', amount: baseAmount(0, DECIMAL) }
  data = events.reduce((acc, { type, attributes }) => {
    if (type === 'transfer') {
      // FIXME (@veado) Currenlty it gets values from last entries only, but that's not correct
      return attributes.reduce((acc2, { key, value }) => {
        if (key === 'sender') acc.sender = value
        if (key === 'recipient') acc.recipient = value
        if (key === 'amount') acc.amount = baseAmount(value.replace(/rune/, ''), DECIMAL)
        return acc2
      }, acc)
    }
    return acc
  }, data)

  const { sender, recipient, amount } = data
  return {
    from: [{ amount, from: sender }],
    to: [{ amount, to: recipient }],
    type: 'transfer',
  }
}

/**
 * Parse transaction type
 *
 * @param {TxResponse} tx The transaction response from the node.
 * @param {Network} network - current main asset which depends on the network.
 * @returns {Txs} The parsed transaction result.
 */
export const getTxDataFromResponse = (tx: TxResponse, network: Network): TxData => {
  registerCodecs(network)

  let msgs: Msg[]
  // StdTx
  if ((tx.tx as StdTx).msg) {
    msgs = codec.fromJSONString(codec.toJSONString(tx.tx as StdTx)).msg
  }
  // RawTxResponse
  else if ((tx.tx as RawTxResponse).body) {
    msgs = codec.fromJSONString(codec.toJSONString((tx.tx as RawTxResponse).body.messages))
  }
  // ignore others
  else {
    throw Error(`Could not parse messages from 'TxResponse' (TxId: ${tx.txhash})`)
  }

  const from: TxFrom[] = []
  const to: TxTo[] = []
  if (msgs) {
    msgs.map((msg) => {
      if (isMsgSend(msg)) {
        const amount = msg.amount
          .map((coin) => baseAmount(coin.amount, DECIMAL))
          .reduce((acc, cur) => acc.plus(cur), baseAmount(0, DECIMAL))

        let from_index = -1

        from.forEach((value, index) => {
          if (value.from === msg.from_address.toBech32()) from_index = index
        })

        if (from_index === -1) {
          from.push({
            from: msg.from_address.toBech32(),
            amount,
          })
        } else {
          from[from_index].amount = from[from_index].amount.plus(amount)
        }

        let to_index = -1

        to.forEach((value, index) => {
          if (value.to === msg.to_address.toBech32()) to_index = index
        })

        if (to_index === -1) {
          to.push({
            to: msg.to_address.toBech32(),
            amount,
          })
        } else {
          to[to_index].amount = to[to_index].amount.plus(amount)
        }
      } else if (isMsgMultiSend(msg)) {
        msg.inputs.map((input) => {
          const amount = input.coins
            .map((coin) => baseAmount(coin.amount, DECIMAL))
            .reduce((acc, cur) => acc.plus(cur), baseAmount(0, DECIMAL))

          let from_index = -1

          from.forEach((value, index) => {
            if (value.from === input.address) from_index = index
          })

          if (from_index === -1) {
            from.push({
              from: input.address,
              amount,
            })
          } else {
            from[from_index].amount = from[from_index].amount.plus(amount)
          }
        })

        msg.outputs.map((output) => {
          const amount = output.coins
            .map((coin) => baseAmount(coin.amount, DECIMAL))
            .reduce((acc, cur) => acc.plus(cur), baseAmount(0, DECIMAL))

          let to_index = -1

          to.forEach((value, index) => {
            if (value.to === output.address) to_index = index
          })

          if (to_index === -1) {
            to.push({
              to: output.address,
              amount,
            })
          } else {
            to[to_index].amount = to[to_index].amount.plus(amount)
          }
        })
      } else {
      }
    })
  }

  return {
    from,
    to,
    type: from.length > 0 || to.length > 0 ? 'transfer' : 'unknown',
  }
}

/**
 * Get the default fee.
 *
 * @returns {Fees} The default fee.
 */
export const getDefaultFees = (): Fees => {
  const fee = baseAmount(DEFAULT_GAS_VALUE, DECIMAL)
  return {
    type: 'base',
    fast: fee,
    fastest: fee,
    average: fee,
  }
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
 * Get the client url.
 *
 * @returns {ClientUrl} The client url (both mainnet and testnet) for thorchain.
 */
export const getDefaultClientUrl = (): ClientUrl => {
  return {
    testnet: {
      node: 'https://testnet.thornode.thorchain.info',
      rpc: 'https://testnet.rpc.thorchain.info',
    },
    mainnet: {
      node: 'https://thornode.thorchain.info',
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
    testnet: `${DEFAULT_EXPLORER_URL}?network=testnet`,
    mainnet: DEFAULT_EXPLORER_URL,
  }
  const txUrl = `${DEFAULT_EXPLORER_URL}/tx`
  const tx: ExplorerUrl = {
    testnet: txUrl,
    mainnet: txUrl,
  }
  const addressUrl = `${DEFAULT_EXPLORER_URL}/address`
  const address: ExplorerUrl = {
    testnet: addressUrl,
    mainnet: addressUrl,
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
  return network === 'mainnet' ? url : `${url}?network=testnet`
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
  return network === 'mainnet' ? url : `${url}?network=testnet`
}
