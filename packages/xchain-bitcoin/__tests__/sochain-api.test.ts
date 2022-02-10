import { Network } from '@xchainjs/xchain-client'

import isTx2ConfirmedResponse from '../__mocks__/response/is-tx-confirmed/8ef74ec4a6473caf7b3ddfcf38cf6db43995ff98c7cbc6d8cf317f3c22e35df2.json'
import isTx1ConfirmedResponse from '../__mocks__/response/is-tx-confirmed/d5d4a0f07c5cc639e379caceb1e4e75f817b94daf698c9242f9c09a212df2fee.json'
import unspentTxsResponse from '../__mocks__/response/unspent-txs/tb1q2pkall6rf6v6j0cvpady05xhy37erndvku08wp.json'
import mockSochainApi from '../__mocks__/sochain'
import * as sochain from '../src/sochain-api'
import { BtcAddressUTXO } from '../src/types/sochain-api-types'

const sochainUrl = 'https://sochain.com/api/v2'
const network = Network.Mainnet

describe('Sochain API Test', () => {
  beforeEach(() => {
    mockSochainApi.init()
  })
  afterEach(() => {
    mockSochainApi.restore()
  })
  it('getUnspentTxs', async () => {
    const address = 'tb1q2pkall6rf6v6j0cvpady05xhy37erndvku08wp'

    const utxos: BtcAddressUTXO[] = await sochain.getUnspentTxs({
      sochainUrl,
      network,
      address,
    })

    expect(utxos).toEqual(unspentTxsResponse.data.txs)
  })

  it('getIsTxConfirmed', async () => {
    const confirmedTxId = 'd5d4a0f07c5cc639e379caceb1e4e75f817b94daf698c9242f9c09a212df2fee'
    const unconfirmedTxId = '8ef74ec4a6473caf7b3ddfcf38cf6db43995ff98c7cbc6d8cf317f3c22e35df2'

    const isTx1Confirmed = await sochain.getIsTxConfirmed({
      sochainUrl,
      network,
      hash: confirmedTxId,
    })

    const isTx2Confirmed = await sochain.getIsTxConfirmed({
      sochainUrl,
      network,
      hash: unconfirmedTxId,
    })

    expect(isTx1Confirmed).toEqual(isTx1ConfirmedResponse.data)
    expect(isTx2Confirmed).toEqual(isTx2ConfirmedResponse.data)
  })

  it('getConfirmedUnspentTxs', async () => {
    const address = 'tb1q2pkall6rf6v6j0cvpady05xhy37erndvku08wp'
    const unconfirmedTxid = '8ef74ec4a6473caf7b3ddfcf38cf6db43995ff98c7cbc6d8cf317f3c22e35df2'

    const confirmedUTXOs = unspentTxsResponse.data.txs.filter((data) => data.txid !== unconfirmedTxid)

    const utxos = await sochain.getConfirmedUnspentTxs({
      sochainUrl,
      network,
      address,
    })

    expect(utxos).toEqual(confirmedUTXOs)
  })
})
