import { Network } from './client'
import * as Utils from './utils'

export const getBalance = (network: Network, address: string) => {
  return Utils.getBalance({
    sochainUrl: 'https://sochain.com/api/v2',
    network,
    address,
  })
}
