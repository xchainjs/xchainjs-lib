/**
 * Round-robin RPC error handling for Cosmos SDK clients.
 *
 * Goal: only treat connection/transport failures as "try next endpoint".
 * Chain / application failures (insufficient funds, bad sequence, etc.) rethrow
 * immediately. When every endpoint fails, surface the last real error so UIs
 * do not only show a generic "No clients available" string.
 *
 * @see https://github.com/xchainjs/xchainjs-lib/issues/1727
 */

/** Tx was not found on any reachable node (distinct from RPC unavailability). */
export class TxNotFoundError extends Error {
  readonly txId: string

  constructor(txId: string) {
    super(`Can not find transaction ${txId}`)
    this.name = 'TxNotFoundError'
    this.txId = txId
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

/**
 * Chain / application errors that should not fail over to the next RPC URL.
 * Connection and most HTTP gateway failures remain retryable so multi-URL
 * configs still work.
 */
const NON_RETRYABLE_SUBSTRINGS = [
  'insufficient funds',
  'insufficient fee',
  'account sequence mismatch',
  'signature verification failed',
  'unauthorized',
  'invalid coins',
  'invalid address',
  'tx parse error',
  'out of gas',
  'failed to execute message',
  'panic message redacted',
  'incorrect account sequence',
  'pubkey type not supported',
  'signature could not be verified',
]

/**
 * @returns true if the error is likely transport/provider related and the next
 * endpoint should be tried; false if the error is a definitive chain rejection.
 */
export function isRetryableRpcError(error: unknown): boolean {
  const msg = errorMessage(error).toLowerCase()

  if (NON_RETRYABLE_SUBSTRINGS.some((s) => msg.includes(s))) {
    return false
  }

  // Explicit codespace-style deliver tx failures (CosmJS often embeds these)
  if (msg.includes('codespace:') && msg.includes('code:')) {
    // Connection errors rarely include both codespace and code
    if (!msg.includes('bad status on response')) {
      return false
    }
  }

  return true
}

/**
 * Build the exhausted-round-robin error, attaching the last underlying failure.
 */
export function createRoundRobinExhaustedError(operation: string, lastError?: unknown): Error {
  const last = lastError !== undefined ? errorMessage(lastError) : undefined
  const message = last
    ? `No clients available. Can not ${operation}. Last error: ${last}`
    : `No clients available. Can not ${operation}`

  const err = new Error(message)
  err.name = 'RoundRobinExhaustedError'
  if (lastError !== undefined) {
    // ES2022 Error cause — useful for programmatic consumers
    ;(err as Error & { cause?: unknown }).cause = lastError
  }
  return err
}

export type RoundRobinTryOptions = {
  /** Override retry classification (default: isRetryableRpcError). */
  isRetryable?: (error: unknown) => boolean
  /** Optional warn hook for skipped retryable failures. */
  onRetryableError?: (error: unknown, index: number) => void
}

/**
 * Run `fn` against each item until one succeeds.
 * Non-retryable errors rethrow immediately; retryable errors continue.
 * If all fail, throws with the last error attached.
 */
export async function roundRobinTry<TItem, TResult>(
  items: readonly TItem[],
  operation: string,
  fn: (item: TItem, index: number) => Promise<TResult>,
  options: RoundRobinTryOptions = {},
): Promise<TResult> {
  const isRetryable = options.isRetryable ?? isRetryableRpcError
  let lastError: unknown

  if (items.length === 0) {
    throw createRoundRobinExhaustedError(operation)
  }

  for (let i = 0; i < items.length; i++) {
    try {
      return await fn(items[i], i)
    } catch (error) {
      lastError = error
      if (!isRetryable(error)) {
        throw error
      }
      options.onRetryableError?.(error, i)
    }
  }

  throw createRoundRobinExhaustedError(operation, lastError)
}
