/**
 * UTXO-specific error codes for better error handling and debugging
 */
export enum UtxoErrorCode {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_FEE_RATE = 'INVALID_FEE_RATE',
  INVALID_MEMO = 'INVALID_MEMO',
  INVALID_UTXO = 'INVALID_UTXO',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TRANSACTION_TOO_LARGE = 'TRANSACTION_TOO_LARGE',
  UTXO_SELECTION_FAILED = 'UTXO_SELECTION_FAILED',
  BROADCAST_ERROR = 'BROADCAST_ERROR',
  SIGNING_ERROR = 'SIGNING_ERROR',
}

/**
 * Enhanced error class for UTXO operations with detailed context
 */
export class UtxoError extends Error {
  public readonly isUtxoError = true

  constructor(public readonly code: UtxoErrorCode, message: string, public readonly details?: Record<string, unknown>) {
    super(message)
    this.name = 'UtxoError'

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, UtxoError.prototype)
  }

  /**
   * Create an insufficient balance error
   */
  static insufficientBalance(required: string, available: string, chain?: string): UtxoError {
    return new UtxoError(
      UtxoErrorCode.INSUFFICIENT_BALANCE,
      `Insufficient balance: required ${required}, available ${available}`,
      { required, available, chain },
    )
  }

  /**
   * Create an invalid address error
   */
  static invalidAddress(address: string, network?: string): UtxoError {
    return new UtxoError(
      UtxoErrorCode.INVALID_ADDRESS,
      `Invalid address: ${address}${network ? ` for network ${network}` : ''}`,
      { address, network },
    )
  }

  /**
   * Create an invalid amount error
   */
  static invalidAmount(amount: string | number, reason?: string): UtxoError {
    const message = `Invalid amount: ${amount}${reason ? ` (${reason})` : ''}`
    return new UtxoError(UtxoErrorCode.INVALID_AMOUNT, message, { amount, reason })
  }

  /**
   * Create an invalid fee rate error
   */
  static invalidFeeRate(feeRate: number, reason?: string): UtxoError {
    const message = `Invalid fee rate: ${feeRate}${reason ? ` (${reason})` : ''}`
    return new UtxoError(UtxoErrorCode.INVALID_FEE_RATE, message, { feeRate, reason })
  }

  /**
   * Create an invalid memo error
   */
  static invalidMemo(memo: string, reason: string): UtxoError {
    return new UtxoError(UtxoErrorCode.INVALID_MEMO, `Invalid memo: ${reason}`, { memo, reason })
  }

  /**
   * Create a provider error
   */
  static providerError(providerName: string, originalError: Error): UtxoError {
    return new UtxoError(UtxoErrorCode.PROVIDER_ERROR, `Provider ${providerName} error: ${originalError.message}`, {
      providerName,
      originalError: originalError.stack,
    })
  }

  /**
   * Create a network error
   */
  static networkError(operation: string, originalError: Error): UtxoError {
    return new UtxoError(UtxoErrorCode.NETWORK_ERROR, `Network error during ${operation}: ${originalError.message}`, {
      operation,
      originalError: originalError.stack,
    })
  }

  /**
   * Create a validation error
   */
  static validationError(message: string, details?: Record<string, unknown>): UtxoError {
    return new UtxoError(UtxoErrorCode.VALIDATION_ERROR, `Validation failed: ${message}`, details)
  }

  /**
   * Create a transaction too large error
   */
  static transactionTooLarge(currentSize: number, maxSize: number): UtxoError {
    return new UtxoError(
      UtxoErrorCode.TRANSACTION_TOO_LARGE,
      `Transaction size ${currentSize} bytes exceeds maximum ${maxSize} bytes`,
      { currentSize, maxSize },
    )
  }

  /**
   * Create a UTXO selection failed error
   */
  static utxoSelectionFailed(targetAmount: number, availableAmount: number, strategy?: string): UtxoError {
    const message = `UTXO selection failed: need ${targetAmount}, have ${availableAmount}${
      strategy ? ` using ${strategy}` : ''
    }`
    return new UtxoError(UtxoErrorCode.UTXO_SELECTION_FAILED, message, { targetAmount, availableAmount, strategy })
  }

  /**
   * Create a broadcast error
   */
  static broadcastError(txHash: string, originalError: Error): UtxoError {
    return new UtxoError(
      UtxoErrorCode.BROADCAST_ERROR,
      `Failed to broadcast transaction ${txHash}: ${originalError.message}`,
      { txHash, originalError: originalError.stack },
    )
  }

  /**
   * Create a signing error
   */
  static signingError(reason: string, details?: Record<string, unknown>): UtxoError {
    return new UtxoError(UtxoErrorCode.SIGNING_ERROR, `Transaction signing failed: ${reason}`, details)
  }

  /**
   * Convert unknown errors to typed UTXO errors
   */
  static fromUnknown(error: unknown, context?: string): UtxoError {
    if (error instanceof UtxoError) {
      return error
    }

    if (error instanceof Error) {
      // Try to categorize common error patterns
      const message = error.message.toLowerCase()

      if (message.includes('insufficient')) {
        return UtxoError.insufficientBalance('unknown', 'unknown')
      }

      if (message.includes('invalid address')) {
        return UtxoError.invalidAddress('unknown')
      }

      if (message.includes('fee') && (message.includes('low') || message.includes('high'))) {
        return UtxoError.invalidFeeRate(0, error.message)
      }

      if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
        return UtxoError.networkError(context || 'unknown', error)
      }

      return new UtxoError(UtxoErrorCode.VALIDATION_ERROR, context ? `${context}: ${error.message}` : error.message, {
        originalError: error.stack,
      })
    }

    return new UtxoError(UtxoErrorCode.VALIDATION_ERROR, context ? `${context}: ${String(error)}` : String(error), {
      originalError: error,
    })
  }

  /**
   * Check if an error is a UTXO error
   */
  static isUtxoError(error: unknown): error is UtxoError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return error instanceof Error && (error as any).isUtxoError === true
  }

  /**
   * Get a user-friendly error message
   */
  getUserFriendlyMessage(): string {
    switch (this.code) {
      case UtxoErrorCode.INSUFFICIENT_BALANCE:
        return 'Insufficient balance to complete this transaction. Please check your balance and try again.'

      case UtxoErrorCode.INVALID_ADDRESS:
        return 'The provided address is not valid. Please check the address format and network.'

      case UtxoErrorCode.INVALID_AMOUNT:
        return 'The transaction amount is not valid. Amount must be greater than zero.'

      case UtxoErrorCode.INVALID_FEE_RATE:
        return 'The fee rate is not valid. Please provide a fee rate between 1 and 1000 sat/byte.'

      case UtxoErrorCode.NETWORK_ERROR:
        return 'Network error occurred. Please check your connection and try again.'

      case UtxoErrorCode.PROVIDER_ERROR:
        return 'Blockchain data provider error. Please try again later.'

      case UtxoErrorCode.TRANSACTION_TOO_LARGE:
        return 'Transaction is too large. Try reducing the number of inputs or splitting into multiple transactions.'

      default:
        return this.message
    }
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      stack: this.stack,
    }
  }
}
