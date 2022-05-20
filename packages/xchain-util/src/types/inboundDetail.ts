// this file is the4 same as midgard.ts
// should this go into a types file?

export type InboundDetail = {
  vault: string
  router?: string
  haltedChain: boolean
  haltedTrading: boolean
  haltedLP: boolean
}

export type ServerInboundDetail = {
  chain: string
  pub_key: string
  address: string
  halted: boolean
  gas_rate: string | number
  router?: string
}
