import { HdPath, stringToPath } from '@cosmjs/crypto'
import { toBech32 } from '@cosmjs/encoding'
import { base64, bech32 } from '@scure/base'

export function makeClientPath(fullDerivationPath: string): HdPath {
  // Ensure the path starts with 'm/' for compatibility
  const path = fullDerivationPath.startsWith('m/') ? fullDerivationPath : `m/${fullDerivationPath}`
  return stringToPath(path)
}

export const bech32ToBase64 = (address: string): string =>
  base64.encode(Uint8Array.from(bech32.fromWords(bech32.decode(address).words)))

export const base64ToBech32 = (address: string, prefix: string): string => toBech32(prefix, base64.decode(address))

export {
  TxNotFoundError,
  createRoundRobinExhaustedError,
  errorMessage,
  isAlreadyBroadcastError,
  isRetryableRpcError,
  roundRobinGetTx,
  roundRobinTry,
  signOnceThenRoundRobinBroadcast,
  tendermintTxHash,
} from './roundRobin'
export type { BroadcastResult, RoundRobinTryOptions, SignOnceThenBroadcastOptions } from './roundRobin'
