import { Network } from '@xchainjs/xchain-client'

/**
 * Function to get the URL for sending a transaction based on the network and Blockcypher URL.
 * Throws an error if the network is 'testnet' since the testnet URL is not available for Blockcypher.
 * @param {object} params Object containing the Blockcypher URL and network type.
 * @param {string} params.blockcypherUrl The Blockcypher URL.
 * @param {Network} params.network The network type (Mainnet, Testnet, or Stagenet).
 * @returns {string} The URL for sending a transaction.
 */
export const getSendTxUrl = ({ blockcypherUrl, network }: { blockcypherUrl: string; network: Network }): string => {
  if (network === 'testnet') {
    // Check if the network is testnet
    throw new Error('Testnet URL is not available for Blockcypher') // Throw an error if testnet URL is requested
  } else {
    return `${blockcypherUrl}/doge/main/txs/push` // Return the mainnet URL for sending a transaction
  }
}
