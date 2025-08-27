import { Address } from '@xchainjs/xchain-util'
import { Network } from '@xchainjs/xchain-client'

import { TxParams, UTXO } from './types'
import { UtxoError } from './errors'

/**
 * Comprehensive input validation for UTXO transactions
 */
export class UtxoTransactionValidator {
  /**
   * Validate transaction parameters
   */
  static validateTransferParams(
    params: TxParams & {
      sender?: Address
      feeRate?: number
    },
  ): void {
    const errors: string[] = []

    // Address validation
    if (!params.recipient?.trim()) {
      errors.push('Recipient address is required')
    } else if (params.recipient.length > 100) {
      errors.push('Recipient address is too long')
    }

    if (params.sender && !params.sender.trim()) {
      errors.push('Sender address cannot be empty')
    }

    // Amount validation
    if (!params.amount) {
      errors.push('Amount is required')
    } else {
      try {
        const amount = params.amount.amount()

        if (amount.lte(0)) {
          errors.push('Amount must be greater than zero')
        }

        // Check for reasonable maximum (21M BTC equivalent in satoshis)
        if (amount.gt('2100000000000000')) {
          errors.push('Amount exceeds maximum possible value')
        }

        // Check for dust amount (546 satoshis is standard dust threshold)
        if (amount.lt(546)) {
          errors.push('Amount is below dust threshold (546 satoshis)')
        }

        // Validate decimal precision
        const decimals = params.amount.decimal
        if (decimals < 0 || decimals > 18) {
          errors.push(`Invalid decimal precision: ${decimals}`)
        }
      } catch (error) {
        errors.push(`Invalid amount format: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Fee rate validation
    if (params.feeRate !== undefined) {
      if (!Number.isFinite(params.feeRate)) {
        errors.push('Fee rate must be a finite number')
      } else if (params.feeRate < 1) {
        errors.push('Fee rate must be at least 1 sat/byte')
      } else if (params.feeRate > 1000000) {
        errors.push('Fee rate is unreasonably high (max 1,000,000 sat/byte)')
      }
    }

    // Memo validation
    if (params.memo !== undefined) {
      if (typeof params.memo !== 'string') {
        errors.push('Memo must be a string')
      } else {
        const memoBytes = Buffer.byteLength(params.memo, 'utf8')
        if (memoBytes > 80) {
          errors.push(`Memo too long: ${memoBytes} bytes (max 80 bytes)`)
        }

        // Check for potentially problematic characters
        if (this.containsControlCharacters(params.memo)) {
          errors.push('Memo contains invalid control characters')
        }

        // Check for null bytes
        if (params.memo.includes('\0')) {
          errors.push('Memo cannot contain null bytes')
        }
      }
    }

    // Wallet index validation
    if (params.walletIndex !== undefined) {
      if (!Number.isInteger(params.walletIndex)) {
        errors.push('Wallet index must be an integer')
      } else if (params.walletIndex < 0) {
        errors.push('Wallet index must be non-negative')
      } else if (params.walletIndex > 2147483647) {
        errors.push('Wallet index exceeds BIP32 hardened key limit')
      }
    }

    if (errors.length > 0) {
      throw UtxoError.validationError(errors.join('; '), {
        validationErrors: errors,
        params: this.sanitizeParamsForLogging(params),
      })
    }
  }

  /**
   * Validate UTXO set for consistency and correctness
   */
  static validateUtxoSet(utxos: UTXO[]): void {
    if (!Array.isArray(utxos)) {
      throw UtxoError.validationError('UTXOs must be an array')
    }

    const errors: string[] = []
    const seenOutpoints = new Set<string>()

    for (const [index, utxo] of utxos.entries()) {
      const prefix = `UTXO[${index}]`

      // Validate UTXO structure
      if (!utxo || typeof utxo !== 'object') {
        errors.push(`${prefix}: UTXO must be an object`)
        continue
      }

      // Validate transaction hash
      if (!utxo.hash) {
        errors.push(`${prefix}: Transaction hash is required`)
      } else if (typeof utxo.hash !== 'string') {
        errors.push(`${prefix}: Transaction hash must be a string`)
      } else if (!/^[a-fA-F0-9]{64}$/.test(utxo.hash)) {
        errors.push(`${prefix}: Invalid transaction hash format`)
      }

      // Validate output index
      if (utxo.index === undefined || utxo.index === null) {
        errors.push(`${prefix}: Output index is required`)
      } else if (!Number.isInteger(utxo.index)) {
        errors.push(`${prefix}: Output index must be an integer`)
      } else if (utxo.index < 0) {
        errors.push(`${prefix}: Output index must be non-negative`)
      } else if (utxo.index > 4294967295) {
        // uint32 max
        errors.push(`${prefix}: Output index exceeds maximum value`)
      }

      // Check for duplicate UTXOs
      const outpoint = `${utxo.hash}:${utxo.index}`
      if (seenOutpoints.has(outpoint)) {
        errors.push(`${prefix}: Duplicate UTXO ${outpoint}`)
      }
      seenOutpoints.add(outpoint)

      // Validate value
      if (utxo.value === undefined || utxo.value === null) {
        errors.push(`${prefix}: UTXO value is required`)
      } else if (!Number.isInteger(utxo.value)) {
        errors.push(`${prefix}: UTXO value must be an integer`)
      } else if (utxo.value <= 0) {
        errors.push(`${prefix}: UTXO value must be positive`)
      } else if (utxo.value > 2100000000000000) {
        // 21M BTC in satoshis
        errors.push(`${prefix}: UTXO value exceeds maximum`)
      }

      // Note: height property not available in current UTXO type definition

      // Validate witness UTXO if present
      if (utxo.witnessUtxo) {
        if (typeof utxo.witnessUtxo !== 'object') {
          errors.push(`${prefix}: witnessUtxo must be an object`)
        } else {
          if (!Buffer.isBuffer(utxo.witnessUtxo.script)) {
            errors.push(`${prefix}: witnessUtxo script must be a Buffer`)
          }
          if (!Number.isInteger(utxo.witnessUtxo.value) || utxo.witnessUtxo.value !== utxo.value) {
            errors.push(`${prefix}: witnessUtxo value mismatch`)
          }
        }
      }

      // Note: nonWitnessUtxo property not available in current UTXO type definition
    }

    if (errors.length > 0) {
      throw UtxoError.validationError(`UTXO validation failed: ${errors.join('; ')}`, {
        utxoCount: utxos.length,
        validationErrors: errors,
      })
    }
  }

  /**
   * Validate address format for specific network
   */
  static validateAddressFormat(address: string, network: Network, chain: string, allowedFormats?: string[]): void {
    if (!address) {
      throw UtxoError.invalidAddress('', network)
    }

    if (typeof address !== 'string') {
      throw UtxoError.validationError('Address must be a string')
    }

    // Basic length check
    if (address.length < 10 || address.length > 100) {
      throw UtxoError.invalidAddress(address, network)
    }

    // Network-specific validation
    switch (chain.toUpperCase()) {
      case 'BTC':
        this.validateBitcoinAddress(address, network, allowedFormats)
        break
      case 'LTC':
        this.validateLitecoinAddress(address, network)
        break
      case 'BCH':
        this.validateBitcoinCashAddress(address, network)
        break
      case 'DOGE':
        this.validateDogecoinAddress(address, network)
        break
      case 'DASH':
        this.validateDashAddress(address, network)
        break
      default:
        // Generic validation for other chains
        if (!/^[a-zA-Z0-9]+$/.test(address)) {
          throw UtxoError.invalidAddress(address, network)
        }
    }
  }

  /**
   * Validate fee rate against network conditions
   */
  static validateFeeRate(
    feeRate: number,
    networkConditions?: {
      minFeeRate?: number
      maxFeeRate?: number
      recommendedRange?: [number, number]
    },
  ): void {
    if (!Number.isFinite(feeRate)) {
      throw UtxoError.invalidFeeRate(feeRate, 'Fee rate must be a finite number')
    }

    const conditions = networkConditions || {}
    const minFee = conditions.minFeeRate || 1
    const maxFee = conditions.maxFeeRate || 1000

    if (feeRate < minFee) {
      throw UtxoError.invalidFeeRate(feeRate, `Below minimum fee rate ${minFee} sat/byte`)
    }

    if (feeRate > maxFee) {
      throw UtxoError.invalidFeeRate(feeRate, `Above maximum fee rate ${maxFee} sat/byte`)
    }

    // Warn if outside recommended range
    if (conditions.recommendedRange) {
      const [recMin, recMax] = conditions.recommendedRange
      if (feeRate < recMin || feeRate > recMax) {
        console.warn(`Fee rate ${feeRate} is outside recommended range ${recMin}-${recMax} sat/byte`)
      }
    }
  }

  /**
   * Validate transaction size limits
   */
  static validateTransactionSize(
    estimatedSize: number,
    maxSize: number = 100000, // Default 100KB limit
  ): void {
    if (estimatedSize <= 0) {
      throw UtxoError.validationError('Transaction size must be positive')
    }

    if (estimatedSize > maxSize) {
      throw UtxoError.transactionTooLarge(estimatedSize, maxSize)
    }

    // Warn for large transactions
    if (estimatedSize > maxSize * 0.8) {
      console.warn(`Transaction size ${estimatedSize} bytes is approaching limit ${maxSize} bytes`)
    }
  }

  // Private helper methods

  private static containsControlCharacters(str: string): boolean {
    // Check for control characters that might cause issues
    return /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(str)
  }

  private static validateBitcoinAddress(address: string, network: Network, allowedFormats?: string[]): void {
    const mainnetPatterns = {
      legacy: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
      segwitV0: /^bc1[02-9ac-hj-np-z]{7,87}$/,
      segwitV1: /^bc1p[02-9ac-hj-np-z]{58}$/,
    }

    const testnetPatterns = {
      legacy: /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
      segwitV0: /^tb1[02-9ac-hj-np-z]{7,87}$/,
      segwitV1: /^tb1p[02-9ac-hj-np-z]{58}$/,
    }

    const patterns = network === Network.Mainnet ? mainnetPatterns : testnetPatterns
    const isValid = Object.values(patterns).some((pattern) => pattern.test(address))

    if (!isValid) {
      throw UtxoError.invalidAddress(address, network)
    }

    // Check allowed formats if specified
    if (allowedFormats && allowedFormats.length > 0) {
      const matchingFormats = Object.entries(patterns)
        .filter(([, pattern]) => pattern.test(address))
        .map(([format]) => format)

      const hasAllowedFormat = matchingFormats.some((format) => allowedFormats.includes(format))
      if (!hasAllowedFormat) {
        throw UtxoError.invalidAddress(address, `${network} (allowed formats: ${allowedFormats.join(', ')})`)
      }
    }
  }

  private static validateLitecoinAddress(address: string, network: Network): void {
    const mainnetPattern = /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$|^ltc1[02-9ac-hj-np-z]{7,87}$/
    const testnetPattern = /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$|^tltc1[02-9ac-hj-np-z]{7,87}$/

    const pattern = network === Network.Mainnet ? mainnetPattern : testnetPattern
    if (!pattern.test(address)) {
      throw UtxoError.invalidAddress(address, network)
    }
  }

  private static validateBitcoinCashAddress(address: string, network: Network): void {
    // Bitcoin Cash supports both legacy and CashAddr formats
    const legacyPattern = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/
    const cashAddrPattern =
      network === Network.Mainnet
        ? /^bitcoincash:[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42}$/
        : /^bchtest:[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42}$/

    if (!legacyPattern.test(address) && !cashAddrPattern.test(address)) {
      throw UtxoError.invalidAddress(address, network)
    }
  }

  private static validateDogecoinAddress(address: string, network: Network): void {
    const mainnetPattern = /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/
    const testnetPattern = /^[nm][a-km-zA-HJ-NP-Z1-9]{25,34}$/

    const pattern = network === Network.Mainnet ? mainnetPattern : testnetPattern
    if (!pattern.test(address)) {
      throw UtxoError.invalidAddress(address, network)
    }
  }

  private static validateDashAddress(address: string, network: Network): void {
    const mainnetPattern = /^X[1-9A-HJ-NP-Za-km-z]{33}$|^7[a-km-zA-HJ-NP-Z1-9]{33}$/
    const testnetPattern = /^[yY][a-km-zA-HJ-NP-Z1-9]{33}$|^8[a-km-zA-HJ-NP-Z1-9]{33}$/

    const pattern = network === Network.Mainnet ? mainnetPattern : testnetPattern
    if (!pattern.test(address)) {
      throw UtxoError.invalidAddress(address, network)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static sanitizeParamsForLogging(params: any): any {
    // Remove sensitive data from params for safe logging
    const sanitized = { ...params }
    if (sanitized.amount) {
      sanitized.amount = sanitized.amount.amount().toString()
    }
    return sanitized
  }
}
