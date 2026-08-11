import type Transport from '@ledgerhq/hw-transport'

/** Wallet connection mode for the suite */
export type SuiteWalletType = 'phrase' | 'ledger'

/**
 * BTC address format options exposed in the suite UI.
 * Maps onto `@xchainjs/xchain-bitcoin` AddressFormat + matching rootDerivationPaths.
 */
export type BtcAddressFormatOption = 'p2wpkh' | 'p2tr' | 'p2pkh' | 'p2sh-p2wpkh'

/**
 * ETH derivation style:
 * - default: BIP44 address index `m/44'/60'/0'/0/{index}`
 * - ledgerLive: account index `m/44'/60'/{index}'/0/0`
 */
export type EthDerivationStyle = 'default' | 'ledgerLive'

/** Chains that can be driven by a Ledger transport in the suite */
export const LEDGER_SUPPORTED_CHAINS = ['BTC', 'ETH'] as const
export type LedgerSupportedChain = (typeof LEDGER_SUPPORTED_CHAINS)[number]

export function isLedgerSupportedChain(chainId: string): chainId is LedgerSupportedChain {
  return (LEDGER_SUPPORTED_CHAINS as readonly string[]).includes(chainId)
}

export type LedgerConnection = {
  transport: Transport
  btcAddressFormat: BtcAddressFormatOption
  ethDerivationStyle: EthDerivationStyle
}
