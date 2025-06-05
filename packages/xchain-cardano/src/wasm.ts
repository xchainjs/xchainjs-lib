import type * as CardanoTypes from '@emurgo/cardano-serialization-lib-browser'

let Cardano: typeof CardanoTypes

export async function getCardano() {
  if (Cardano) return Cardano
  Cardano = await import('@emurgo/cardano-serialization-lib-browser')
  return Cardano
}
