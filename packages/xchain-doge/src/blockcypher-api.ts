import { Network } from '@xchainjs/xchain-client'

export const getSendTxUrl = ({ blockcypherUrl, network }: { blockcypherUrl: string; network: Network }) => {
  if (network === 'testnet') {
    throw new Error('Testnet URL is not available for blockcypher')
  } else {
    return `${blockcypherUrl}/doge/main/txs/push`
  }
}
