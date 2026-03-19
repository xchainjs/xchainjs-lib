const STORAGE_KEY = 'xchain-suite-swap-history'
const MAX_ENTRIES = 50

export interface SwapHistoryEntry {
  id: string
  timestamp: number
  fromAsset: string // e.g. "BTC.BTC"
  toAsset: string // e.g. "ETH.ETH"
  inputAmount: string
  expectedOutput: string
  protocol: 'Thorchain' | 'Mayachain' | 'Chainflip' | 'OneClick'
  slippageBps: number
  txHash: string
  explorerUrl: string
  depositChannelId?: string
  status: 'submitted' | 'completed' | 'failed'
}

function load(): SwapHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(entries: SwapHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function addEntry(entry: SwapHistoryEntry) {
  const entries = load()
  entries.unshift(entry)
  save(entries.slice(0, MAX_ENTRIES))
}

export function getHistory(): SwapHistoryEntry[] {
  return load()
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
}
