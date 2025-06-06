import { Asset, baseAmount } from '@xchainjs/xchain-util'

import { AssetXRP, XRP_DECIMAL, XRPChain } from './const'
import { decode, encode } from 'ripple-binary-codec'
import { Balance, Network } from '@xchainjs/xchain-client'

import axios from 'axios'

// Encode memo for XRP transaction
export const encodeMemo = (memo: string): string => {
  return Buffer.from(memo, 'utf8').toString('hex')
}

// Decode memo from XRP transaction
export const decodeMemo = (memoHex: string): string => {
  return Buffer.from(memoHex, 'hex').toString('utf8')
}

// Generate XRP address from public key (simplified, requires proper derivation in practice)
export const publicKeyToAddress = (publicKey: string): string => {
  try {
    // Simplified: real implementation needs proper XRP address encoding
    return encode(Buffer.from(publicKey, 'hex'))
  } catch (error: any) {
    throw new Error(`Failed to generate address: ${error.message}`)
  }
}

// Check if asset is XRP
export const isAssetXRP = (asset: Asset): boolean => {
  return asset.chain === XRPChain && asset.symbol === 'XRP' && asset.ticker === 'XRP'
}
/**
 * Get the balance of an address.
 *
 * @param {AddressParams} params The parameters for fetching the balance.
 * @returns {Balance[]} The balance of the address.
 */
export const getBalance = async (params: {
  nodeUrl: string
  network: Network
  address: string
}): Promise<Balance[]> => {
  try {
    const response = await axios.post(params.nodeUrl, {
      method: 'account_info',
      params: [{ account: params.address, ledger_index: 'validated' }],
    })
    const balance = response.data.result.account_data.Balance
    return [
      {
        asset: AssetXRP,
        amount: baseAmount(balance, XRP_DECIMAL),
      },
    ]
  } catch (error) {
    throw new Error(`Could not get balances for address ${params.address}`)
  }
}

/**
 * Validates an XRP address.
 *
 * @param {string} address The address to validate.
 * @returns {boolean} True if the address is valid, false otherwise.
 */
export const validateAddress = (address: string): boolean => {
  try {
    // Check if address starts with 'r' and has valid length (25-35 characters)
    if (!address.startsWith('r') || address.length < 25 || address.length > 35) {
      return false
    }
    // Use ripple-address-codec to decode and validate
    decode(address)
    return true
  } catch (error) {
    return false
  }
}
