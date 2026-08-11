import type Transport from '@ledgerhq/hw-transport'
import TransportWebHID from '@ledgerhq/hw-transport-webhid'

/**
 * Open a Ledger device over WebHID (Chrome / Chromium / Edge).
 * Must be called from a user gesture (button click).
 *
 * Cast through `unknown` because nested `@ledgerhq/devices` versions under
 * hw-transport-webhid can diverge from the top-level hw-transport types.
 */
export async function openLedgerTransport(): Promise<Transport> {
  if (typeof navigator === 'undefined' || !('hid' in navigator)) {
    throw new Error(
      'WebHID is not available in this browser. Use Chrome, Edge, or another Chromium browser with WebHID support.',
    )
  }

  // Prefer an already-authorized device when possible
  const existing = await TransportWebHID.list()
  if (existing.length > 0) {
    try {
      return (await TransportWebHID.open(existing[0])) as unknown as Transport
    } catch {
      // Fall through to request a fresh permission
    }
  }

  return (await TransportWebHID.create()) as unknown as Transport
}

export async function closeLedgerTransport(transport: Transport | null | undefined): Promise<void> {
  if (!transport) return
  try {
    await transport.close()
  } catch (e) {
    console.warn('[ledger] Failed to close transport:', e)
  }
}
