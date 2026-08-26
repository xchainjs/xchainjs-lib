/**
 * monero-wallet-rpc JSON-RPC client.
 *
 * monerod has no wallet state. Balance queries against a local node go through
 * wallet-rpc, which scans with the view key and keeps the result on disk.
 */

interface JsonRpcResponse<T> {
  id: string
  jsonrpc: string
  result: T
}

export class WalletRpcError extends Error {
  constructor(message: string, readonly code: number) {
    super(message)
    this.name = 'WalletRpcError'
  }
}

export interface EnsureWalletOptions {
  filename: string
  address: string
  spendKey: string
  viewKey: string
  password: string
  restoreHeight: number
}

export interface WalletBalance {
  balance: string
  unlockedBalance: string
}

export interface WalletHeight {
  height: number
}

export interface WalletTransferDestination {
  address: string
  amount: string
}

export interface WalletTransfer {
  txid: string
  timestamp: number
  height: number
  amount: string
  fee: string
  type: string
  address: string
  destinations: WalletTransferDestination[]
}

interface RawTransfer {
  txid?: string
  timestamp?: number
  height?: number
  amount?: number | string
  fee?: number | string
  type?: string
  address?: string
  destinations?: { address?: string; amount?: number | string }[]
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const isBusyError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  return message.includes('busy') || message.includes('refreshing')
}

const isAlreadyOpenError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  return message.includes('already open') || message.includes('already opened')
}

const isNoWalletError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  return (
    message.includes('no wallet file') ||
    message.includes('no wallet') ||
    message.includes('wallet does not exist') ||
    message.includes('failed to open') ||
    message.includes('file not found') ||
    message.includes("doesn't exist") ||
    message.includes('does not exist')
  )
}

const isConnectionError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  return (
    message.includes('failed to fetch') ||
    message.includes('fetch failed') ||
    message.includes('econnrefused') ||
    message.includes('networkerror') ||
    message.includes('network request failed')
  )
}

const DEFAULT_RPC_TIMEOUT_MS = 30_000
/** Cold wallet refresh against a local node can take several minutes. */
const REFRESH_RPC_TIMEOUT_MS = 10 * 60 * 1000

async function jsonRpc<T>(url: string, method: string, params?: Record<string, unknown>): Promise<T> {
  const timeoutMs = method === 'refresh' ? REFRESH_RPC_TIMEOUT_MS : DEFAULT_RPC_TIMEOUT_MS
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(`${url}/json_rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '0',
        method,
        params: params ?? {},
      }),
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Wallet RPC timeout after ${timeoutMs}ms calling ${method}`)
    }
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Wallet RPC unreachable: ${message}`)
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new Error(`Wallet RPC error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as JsonRpcResponse<T> & { error?: { code: number; message: string } }
  if (data.error) {
    throw new WalletRpcError(data.error.message, data.error.code)
  }
  return data.result
}

export async function getVersion(url: string): Promise<number> {
  const result = await jsonRpc<{ version: number }>(url, 'get_version')
  return result.version
}

export async function getAddress(url: string, accountIndex = 0): Promise<string> {
  const result = await jsonRpc<{ address: string }>(url, 'get_address', { account_index: accountIndex })
  return result.address
}

export async function openWallet(url: string, filename: string, password: string): Promise<void> {
  await jsonRpc(url, 'open_wallet', { filename, password })
}

export async function closeWallet(url: string): Promise<void> {
  await jsonRpc(url, 'close_wallet')
}

export async function transfer(
  url: string,
  params: { address: string; amountPiconero: string; priority?: number },
): Promise<string> {
  const amount = BigInt(params.amountPiconero)
  if (amount <= BigInt(0)) throw new Error('Transfer amount must be positive')
  if (amount > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Transfer amount exceeds wallet-rpc JSON integer precision')
  }

  const result = await jsonRpc<{ tx_hash?: string }>(url, 'transfer', {
    destinations: [{ amount: Number(amount), address: params.address }],
    account_index: 0,
    priority: params.priority ?? 2,
    get_tx_key: true,
  })

  if (!result.tx_hash) throw new Error('Wallet RPC transfer returned no tx_hash')
  return result.tx_hash
}

export async function generateFromKeys(url: string, options: EnsureWalletOptions): Promise<void> {
  await jsonRpc(url, 'generate_from_keys', {
    filename: options.filename,
    address: options.address,
    spendkey: options.spendKey,
    viewkey: options.viewKey,
    password: options.password,
    restore_height: options.restoreHeight,
    autosave_current: true,
  })
}

export async function refresh(url: string, startHeight?: number): Promise<void> {
  await jsonRpc(url, 'refresh', startHeight !== undefined ? { start_height: startHeight } : {})
}

export async function getHeight(url: string): Promise<WalletHeight> {
  return jsonRpc<WalletHeight>(url, 'get_height')
}

function normalizeTransfer(raw: RawTransfer): WalletTransfer {
  return {
    txid: raw.txid ?? '',
    timestamp: raw.timestamp ?? 0,
    height: raw.height ?? 0,
    amount: String(raw.amount ?? 0),
    fee: String(raw.fee ?? 0),
    type: raw.type ?? '',
    address: raw.address ?? '',
    destinations: (raw.destinations ?? [])
      .filter((dest): dest is { address: string; amount: number | string } => Boolean(dest.address))
      .map((dest) => ({ address: dest.address, amount: String(dest.amount ?? 0) })),
  }
}

export async function getTransfers(url: string, accountIndex = 0): Promise<WalletTransfer[]> {
  const result = await jsonRpc<{
    in?: RawTransfer[]
    out?: RawTransfer[]
  }>(url, 'get_transfers', {
    in: true,
    out: true,
    pending: false,
    failed: false,
    pool: false,
    account_index: accountIndex,
  })

  return [...(result.in ?? []), ...(result.out ?? [])].map(normalizeTransfer).filter((tx) => tx.txid && tx.height > 0)
}

export async function getBalance(url: string, accountIndex = 0): Promise<WalletBalance> {
  const result = await jsonRpc<{ balance: number | string; unlocked_balance: number | string }>(url, 'get_balance', {
    account_index: accountIndex,
  })
  return {
    balance: String(result.balance),
    unlockedBalance: String(result.unlocked_balance),
  }
}

export async function waitUntilReachable(url: string, timeoutMs = 30_000): Promise<void> {
  const started = Date.now()
  let lastError: unknown
  while (Date.now() - started < timeoutMs) {
    try {
      await getVersion(url)
      return
    } catch (error) {
      lastError = error
      if (isConnectionError(error) || isBusyError(error)) {
        await sleep(500)
        continue
      }
      // HTTP/RPC answered. get_version is available, or the process rejected
      // the call for a non-transport reason — either way we can proceed.
      if (error instanceof WalletRpcError) return
      throw error
    }
  }
  const message = lastError instanceof Error ? lastError.message : String(lastError)
  throw new Error(`Monero wallet RPC is not reachable at ${url}: ${message}`)
}

async function assertOpenAddress(url: string, expected: string): Promise<void> {
  const current = await getAddress(url)
  if (current !== expected) {
    throw new Error('Wallet RPC has a different wallet open than the derived suite address')
  }
}

export async function ensureWallet(url: string, options: EnsureWalletOptions): Promise<void> {
  await waitUntilReachable(url)

  try {
    const current = await getAddress(url)
    if (current === options.address) return
  } catch {
    // No wallet open yet.
  }

  try {
    await openWallet(url, options.filename, options.password)
    await assertOpenAddress(url, options.address)
    return
  } catch (error) {
    if (isAlreadyOpenError(error)) {
      try {
        await assertOpenAddress(url, options.address)
        return
      } catch {
        await closeWallet(url)
      }
    } else if (!isNoWalletError(error) && !(error instanceof WalletRpcError)) {
      throw error
    }
  }

  try {
    await generateFromKeys(url, options)
    await assertOpenAddress(url, options.address)
  } catch (error) {
    if (isAlreadyOpenError(error)) {
      await assertOpenAddress(url, options.address)
      return
    }
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    if (message.includes('already exists')) {
      await openWallet(url, options.filename, options.password)
      await assertOpenAddress(url, options.address)
      return
    }
    throw error
  }
}

export async function callWithBusyRetry<T>(fn: () => Promise<T>, attempts = 40, delayMs = 1500): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isBusyError(error) || i === attempts - 1) throw error
      await sleep(delayMs)
    }
  }
  throw lastError
}
