export type AddressDetails = {
  balance: number
  balanceSat: number
  totalReceived: number
  totalReceivedSat: number
  totalSent: number
  totalSentSat: number
  unconfirmedBalance: number
  unconfirmedBalanceSat: number
  unconfirmedTxApperances: number
  txApperances: number
  transactions: string[]
  legacyAddress: string
  cashAddress: string
  slpAddress: string
  addrStr?: string
  currentPage: number
  pagesTotal: number
}

export type TransactionsInterface = {
  txid: string
  version: number
  locktime: number
  vin: VinInterface[]
  vout: VoutInterface[]
  blockhash: string
  blockheight: number
  confirmations: number
  time: number
  blocktime: number
  valueOut: number
  size: number
  valueIn: number
  fees: number
  legacyAddress: string
  cashAddress: string
  slpAddress: string
  currentPage: number
}

export type VinInterface = {
  txid: string
  vout: number
  sequence: number
  n: number
  scriptSig: {
    hex: string
    asm: string
  }
  value: number
  legacyAddress: string
  cashAddress: string
}

export type VoutInterface = {
  value: string
  n: number
  scriptPubKey: {
    hex: string
    asm: string
    addresses: string[]
    type: string
    cashAddrs: string[]
  }
  spentTxId: string | null
  spentIndex: number | null
  spentHeight: number | null
}