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
