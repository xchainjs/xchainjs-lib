/**
 * Round-robin RPC error handling for Cosmos SDK clients.
 *
 * Goal: only treat connection/transport failures as "try next endpoint".
 * Chain / application failures rethrow immediately. When every endpoint fails,
 * surface the last real error so UIs do not only show a generic
 * "No clients available" string.
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
 * Positive allowlist: only these transport / gateway failures fail over to the
 * next RPC URL. Everything else (4xx, chain rejections, unknown) is non-retryable.
 */
const RETRYABLE_RPC_ERROR_PATTERNS: RegExp[] = [
  /failed to fetch/i,
  /fetch failed/i,
  /networkerror/i,
  /network request failed/i,
  /econnrefused/i,
  /econnreset/i,
  /enotfound/i,
  /eai_again/i,
  /etimedout/i,
  /socket hang up/i,
  /socket closed/i,
  /request timed out/i,
  /timeout/i,
  /aborted/i,
  /ehostunreach/i,
  /enetunreach/i,
  // CosmJS Tendermint HTTP gateway errors — only 5xx (and 429) are retryable
  /bad status on response:\s*(429|5\d\d)\b/i,
  /status code\s*(429|5\d\d)\b/i,
  /http (429|5\d\d)\b/i,
]

/**
 * @returns true if the error is a known transport/gateway failure and the next
 * endpoint should be tried; false for chain/application errors and unknowns.
 */
export function isRetryableRpcError(error: unknown): boolean {
  const msg = errorMessage(error)
  return RETRYABLE_RPC_ERROR_PATTERNS.some((pattern) => pattern.test(msg))
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

/**
 * Fetch a tx across multiple clients.
 * - Returns the first non-null tx.
 * - `null` from a client counts as not-found for that endpoint (try next).
 * - Retryable RPC errors try the next client.
 * - Non-retryable errors rethrow immediately.
 * - If **every** client returns null → `TxNotFoundError`.
 * - If mixed null + provider failures → exhausted error with last error (not TxNotFound).
 */
export async function roundRobinGetTx<TClient, TTx>(
  clients: readonly TClient[],
  txId: string,
  getTx: (client: TClient) => Promise<TTx | null>,
): Promise<TTx> {
  let lastError: unknown
  let notFoundCount = 0

  if (clients.length === 0) {
    throw createRoundRobinExhaustedError(`retrieve transaction ${txId}`)
  }

  for (const client of clients) {
    try {
      const tx = await getTx(client)
      if (!tx) {
        notFoundCount++
        continue
      }
      return tx
    } catch (error) {
      lastError = error
      if (!isRetryableRpcError(error)) {
        throw error
      }
    }
  }

  // Only when every client successfully reported "missing" — not when providers failed.
  if (notFoundCount === clients.length) {
    throw new TxNotFoundError(txId)
  }

  throw createRoundRobinExhaustedError(`retrieve transaction ${txId}`, lastError)
}
