import nock from 'nock'
import { TxHistoryResponse } from '@xchainjs/xchain-cosmos'
import { BroadcastTxCommitResult, Coin } from 'cosmos-client/api'
import { MsgSend, MsgMultiSend } from 'cosmos-client/x/bank'
import { codec } from 'cosmos-client/codec'

import { CosmosSDKClient } from '../src/cosmos/sdk-client'

const assertTxsPost = (
  url: string,
  from_address: string,
  to_address: string,
  msg_type: string,
  send_amount: Coin[],
  memo: undefined | string,
  result: BroadcastTxCommitResult,
): void => {
  nock(url, { allowUnmocked: true })
    .post(`/txs`, (body) => {
      expect(body.tx.msg.length).toEqual(1)
      expect(body.tx.msg[0].type).toEqual(msg_type)
      expect(body.tx.msg[0].value.from_address).toEqual(from_address)
      expect(body.tx.msg[0].value.to_address).toEqual(to_address)
      expect(body.tx.msg[0].value.amount).toEqual(send_amount)
      expect(body.tx.memo).toEqual(memo)
      return true
    })
    .reply(200, result)
}

const assertTxHstory = (url: string, address: string, result: TxHistoryResponse): void => {
  nock(url).get(`/txs?message.sender=${address}`).reply(200, result)
}

describe('SDK Client Test', () => {
  const cosmosMainnetClient: CosmosSDKClient = new CosmosSDKClient({
    server: 'https://api.cosmos.network',
    chainId: 'cosmoshub-3',
    prefix: 'cosmos',
    derive_path: "44'/118'/0'/0/0",
  })
  const cosmosTestnetClient: CosmosSDKClient = new CosmosSDKClient({
    server: 'http://lcd.gaia.bigdipper.live:1317',
    chainId: 'gaia-3a',
    prefix: 'cosmos',
    derive_path: "44'/118'/0'/0/0",
  })
  const thorMainnetClient: CosmosSDKClient = new CosmosSDKClient({
    server: 'http://104.248.96.152:1317',
    chainId: 'thorchain',
    prefix: 'thor',
    derive_path: "44'/931'/0'/0/0",
  })
  const thorTestnetClient: CosmosSDKClient = new CosmosSDKClient({
    server: 'http://13.238.212.224:1317',
    chainId: 'thorchain',
    prefix: 'tthor',
    derive_path: "44'/931'/0'/0/0",
  })

  const cosmos_phrase = 'foster blouse cattle fiction deputy social brown toast various sock awkward print'
  const cosmos_address = 'cosmos16mzuy68a9xzqpsp88dt4f2tl0d49drhepn68fg'

  const thor_phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
  const thor_mainnet_address = 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws'
  const thor_testnet_address = 'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4'

  it('getPrivKeyFromMnemonic -> getAddressFromPrivKey', async () => {
    let privKey = cosmosMainnetClient.getPrivKeyFromMnemonic(cosmos_phrase)
    expect(cosmosMainnetClient.getAddressFromPrivKey(privKey)).toEqual(cosmos_address)

    privKey = cosmosTestnetClient.getPrivKeyFromMnemonic(cosmos_phrase)
    expect(cosmosTestnetClient.getAddressFromPrivKey(privKey)).toEqual(cosmos_address)

    privKey = thorMainnetClient.getPrivKeyFromMnemonic(thor_phrase)
    expect(thorMainnetClient.getAddressFromPrivKey(privKey)).toEqual(thor_mainnet_address)

    privKey = thorTestnetClient.getPrivKeyFromMnemonic(thor_phrase)
    expect(thorTestnetClient.getAddressFromPrivKey(privKey)).toEqual(thor_testnet_address)
  })

  it('checkAddress', async () => {
    expect(cosmosMainnetClient.checkAddress(cosmos_address)).toBeTruthy()
    expect(cosmosTestnetClient.checkAddress(cosmos_address)).toBeTruthy()
    expect(cosmosMainnetClient.checkAddress('thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws')).toBeFalsy()
    expect(cosmosTestnetClient.checkAddress('tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4')).toBeFalsy()

    expect(thorMainnetClient.checkAddress('thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws')).toBeTruthy()
    expect(thorTestnetClient.checkAddress('tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4')).toBeTruthy()
    expect(thorMainnetClient.checkAddress(cosmos_address)).toBeFalsy()
    expect(thorTestnetClient.checkAddress(cosmos_address)).toBeFalsy()
    expect(thorMainnetClient.checkAddress('tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4')).toBeFalsy()
    expect(thorTestnetClient.checkAddress('thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws')).toBeFalsy()
  })

  it('getBalance', async () => {
    let balances = await cosmosMainnetClient.getBalance(cosmos_address)
    expect(balances).toEqual([])

    balances = await cosmosTestnetClient.getBalance('cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv')
    expect(parseInt(balances[0].amount || '0')).toEqual(75000000)
    expect(balances[0].denom).toEqual('umuon')

    balances = await thorMainnetClient.getBalance('thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5')
    expect(balances.length).toBeGreaterThan(0)
    expect(parseInt(balances[0].amount || '0')).toBeGreaterThan(0)
    expect(balances[0].denom).toEqual('thor')

    balances = await thorTestnetClient.getBalance(thor_testnet_address)
    expect(balances).toEqual([])
  })

  it('searchTx', async () => {
    let txHistory = await cosmosMainnetClient.searchTx({ messageSender: cosmos_address })
    expect(parseInt(txHistory.total_count?.toString() || '0')).toEqual(0)

    txHistory = await cosmosTestnetClient.searchTx({ messageSender: 'cosmos1xvt4e7xd0j9dwv2w83g50tpcltsl90h52003e2' })
    expect(parseInt(txHistory.total_count?.toString() || '0')).toBeGreaterThan(0)

    txHistory = await thorMainnetClient.searchTx({ messageSender: thor_mainnet_address })
    expect(parseInt(txHistory.total_count?.toString() || '0')).toEqual(0)

    assertTxHstory('http://13.238.212.224:1317', thor_testnet_address, {
      count: 1,
      limit: 30,
      page_number: 1,
      page_total: 1,
      total_count: 1,
      txs: [
        {
          height: 1047,
          txhash: '098E70A9529AC8F1A57AA0FE65D1D13040B0E803AB8BE7F3B32098164009DED3',
          raw_log: 'transaction logs',
          gas_wanted: '5000000000000000',
          gas_used: '148996',
          tx: {
            body: {
              messages: [
                {
                  type: 'thorchain/MsgSend',
                  value: {
                    from_address: 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws',
                    to_address: 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws',
                    amount: [
                      {
                        denom: 'thor',
                        amount: 1000000,
                      },
                    ],
                  },
                },
              ],
            },
          },
          timestamp: '2020-09-25T06:09:15Z',
        },
      ],
    })

    txHistory = await thorTestnetClient.searchTx({ messageSender: thor_testnet_address })
    expect(parseInt(txHistory.total_count?.toString() || '0')).toEqual(1)
  })

  it('transfer', async () => {
    const expected_txsPost_result: BroadcastTxCommitResult = {
      check_tx: {},
      deliver_tx: {},
      txhash: 'EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D',
      height: 0,
    }

    assertTxsPost(
      'http://13.238.212.224:1317',
      thor_testnet_address,
      'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4',
      'thorchain/MsgSend',
      [
        {
          denom: 'thor',
          amount: '10000',
        },
      ],
      'transfer',
      expected_txsPost_result,
    )

    codec.registerCodec('thorchain/MsgSend', MsgSend, MsgSend.fromJSON)
    codec.registerCodec('thorchain/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)

    let result = await thorTestnetClient.transfer({
      privkey: thorTestnetClient.getPrivKeyFromMnemonic(thor_phrase),
      from: thor_testnet_address,
      to: 'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4',
      amount: 10000,
      asset: 'thor',
      memo: 'transfer',
    })

    expect(result).toEqual(expected_txsPost_result)

    assertTxsPost(
      'http://lcd.gaia.bigdipper.live:1317',
      cosmos_address,
      'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv',
      'cosmos-sdk/MsgSend',
      [
        {
          denom: 'muon',
          amount: '10000',
        },
      ],
      'transfer',
      expected_txsPost_result,
    )

    codec.registerCodec('cosmos-sdk/MsgSend', MsgSend, MsgSend.fromJSON)
    codec.registerCodec('cosmos-sdk/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)

    result = await cosmosTestnetClient.transfer({
      privkey: cosmosTestnetClient.getPrivKeyFromMnemonic(cosmos_phrase),
      from: cosmos_address,
      to: 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv',
      amount: 10000,
      asset: 'muon',
      memo: 'transfer',
    })

    expect(result).toEqual(expected_txsPost_result)
  })
})
