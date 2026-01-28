import { Address } from '@xchainjs/xchain-util'
import { FeeBounds } from '@xchainjs/xchain-client'

import { TxParams, UTXO } from './types'
import { UtxoError } from './errors'
import { DUST_THRESHOLD, MAX_REASONABLE_AMOUNT, MAX_UTXO_DECIMALS } from './constants'

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
    feeBounds?: FeeBounds,
  ): void {
    const errors: string[] = []

    // Address validation - basic checks only
    // Chain-specific validation should be done by the respective client packages
    try {
      this.validateAddressBasic(params.recipient)
    } catch (error) {
      if (error instanceof UtxoError) {
        errors.push(`Invalid recipient address: ${error.message}`)
      }
    }

    if (params.sender) {
      try {
        this.validateAddressBasic(params.sender)
      } catch (error) {
        if (error instanceof UtxoError) {
          errors.push(`Invalid sender address: ${error.message}`)
        }
      }
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
        if (amount.gt(MAX_REASONABLE_AMOUNT)) {
          errors.push('Amount exceeds maximum possible value')
        }

        // Check for dust amount using the standard UTXO dust threshold
        if (amount.lt(DUST_THRESHOLD)) {
          errors.push(`Amount is below dust threshold (${DUST_THRESHOLD} satoshis)`)
        }

        // Validate decimal precision for UTXO chains
        const decimals = params.amount.decimal
        if (decimals < 0 || decimals > MAX_UTXO_DECIMALS) {
          errors.push(`Invalid decimal precision: ${decimals} (UTXO chains support max ${MAX_UTXO_DECIMALS} decimals)`)
        }
      } catch (error) {
        errors.push(`Invalid amount format: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Fee rate validation
    if (params.feeRate !== undefined) {
      if (!Number.isFinite(params.feeRate)) {
        errors.push('Fee rate must be a finite number')
      } else {
        const bounds = feeBounds || { lower: 1, upper: 1000 }
        if (params.feeRate < bounds.lower) {
          errors.push(`Fee rate must be at least ${bounds.lower} sat/byte`)
        } else if (params.feeRate > bounds.upper) {
          errors.push(`Fee rate is unreasonably high (max ${bounds.upper} sat/byte)`)
        }
      }
    }

    // Memo validation (TypeScript ensures string type at compile time)
    if (params.memo !== undefined) {
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

    // Wallet index validation
    if (params.walletIndex !== undefined) {
      if (!Number.isInteger(params.walletIndex)) {
        errors.push('Wallet index must be an integer')
      } else if (params.walletIndex < 0) {
        errors.push('Wallet index must be non-negative')
      } else if (params.walletIndex > 2147483647) {
        errors.push('Wallet index exceeds maximum non-hardened index (2^31-1)')
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
   * Basic address validation - checks for null/empty and basic format
   * NOTE: Chain-specific validation should be done by the respective client packages
   */
  static validateAddressBasic(address: string): void {
    if (!address) {
      throw UtxoError.validationError('Address cannot be empty')
    }

    if (typeof address !== 'string') {
      throw UtxoError.validationError('Address must be a string')
    }

    if (address.trim() !== address) {
      throw UtxoError.validationError('Address cannot have leading or trailing whitespace')
    }

    // Basic length check - most crypto addresses are between 25-100 characters
    if (address.length < 10 || address.length > 100) {
      throw UtxoError.validationError('Address length is invalid')
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
    // Ranges: 0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F, 0x7F
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i)
      if (
        (code >= 0x00 && code <= 0x08) || // \x00-\x08
        code === 0x0b || // \x0B (vertical tab)
        code === 0x0c || // \x0C (form feed)
        (code >= 0x0e && code <= 0x1f) || // \x0E-\x1F
        code === 0x7f // \x7F (DEL)
      ) {
        return true
      }
    }
    return false
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
