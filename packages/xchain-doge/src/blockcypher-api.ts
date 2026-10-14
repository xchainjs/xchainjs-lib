import { Network } from '@xchainjs/xchain-client'

export const getSendTxUrl = ({ blockcypherUrl, network }: { blockcypherUrl: string; network: Network }): string => {
  if (network === 'testnet') {
    throw new Error('Testnet URL is not available for Blockcypher')
  } else {
    return `${blockcypherUrl}/doge/main/txs/push`
  }
}
