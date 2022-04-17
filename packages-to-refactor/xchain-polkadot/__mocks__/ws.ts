// Copyright 2017-2020 @polkadot/rpc-provider authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Server, WebSocket } from 'mock-socket'

export interface Scope {
  body: { [index: string]: Record<string, unknown> }
  requests: number
  server: Server
  done: () => void
}

global.WebSocket = WebSocket

function mockWs(wsUrl: string): Scope {
  console.log(wsUrl)
  const server = new Server(wsUrl)

  const scope: Scope = {
    body: {},
    done: (): void => {
      server.stop((): void => {})
    },
    requests: 0,
    server,
  }

  server.on('connection', (socket): void => {
    socket.on('message', (body): void => {
      if (typeof body !== 'string') throw new Error('expected body to be a string')
      const request = JSON.parse(body)
      console.log('request method', request.method)
      switch (request.method) {
        case 'chain_getBlockHash':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              result: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
              id: request.id,
            }),
          )
          break
        case 'state_getRuntimeVersion':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              result: {
                apis: [
                  ['0xdf6acb689907609b', 3],
                  ['0x37e397fc7c91f5e4', 1],
                  ['0x40fe3ad401f8959a', 4],
                  ['0xd2bc9897eed08f15', 2],
                  ['0xf78b278be53f454c', 2],
                  ['0xaf2c0297a23e6d3d', 1],
                  ['0xed99c5acb25eedf5', 2],
                  ['0xcbca25e39f142387', 2],
                  ['0x687ad44ad37f03c2', 1],
                  ['0xab3c0572291feb8b', 1],
                  ['0xbc9d89904f5b923f', 1],
                  ['0x37c8bb1350a9a2a8', 1],
                ],
                authoringVersion: 2,
                implName: 'parity-westend',
                implVersion: 1,
                specName: 'westend',
                specVersion: 45,
                transactionVersion: 3,
              },
              id: request.id,
            }),
          )
          break
        case 'system_chain':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              result: 'Westend',
              id: request.id,
            }),
          )
          break
        case 'system_properties':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              result: {
                ss58Format: 42,
                tokenDecimals: 12,
                tokenSymbol: 'WND',
              },
              id: request.id,
            }),
          )
          break
        case 'state_subscribeRuntimeVersion':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              result: 'UUTpLkvV3f6BB0IE',
              id: request.id,
            }),
          )
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'state_runtimeVersion',
              params: {
                result: {
                  apis: [
                    ['0xdf6acb689907609b', 3],
                    ['0x37e397fc7c91f5e4', 1],
                    ['0x40fe3ad401f8959a', 4],
                    ['0xd2bc9897eed08f15', 2],
                    ['0xf78b278be53f454c', 2],
                    ['0xaf2c0297a23e6d3d', 1],
                    ['0xed99c5acb25eedf5', 2],
                    ['0xcbca25e39f142387', 2],
                    ['0x687ad44ad37f03c2', 1],
                    ['0xab3c0572291feb8b', 1],
                    ['0xbc9d89904f5b923f', 1],
                    ['0x37c8bb1350a9a2a8', 1],
                  ],
                  authoringVersion: 2,
                  implName: 'parity-westend',
                  implVersion: 1,
                  specName: 'westend',
                  specVersion: 45,
                  transactionVersion: 3,
                },
                subscription: 'UUTpLkvV3f6BB0IE',
              },
            }),
          )
          break
        case 'rpc_methods':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              result: {
                methods: [
                  'account_nextIndex',
                  'author_hasKey',
                  'author_hasSessionKeys',
                  'author_insertKey',
                  'author_pendingExtrinsics',
                  'author_removeExtrinsic',
                  'author_rotateKeys',
                  'author_submitAndWatchExtrinsic',
                  'author_submitExtrinsic',
                  'author_unwatchExtrinsic',
                  'babe_epochAuthorship',
                  'chain_getBlock',
                  'chain_getBlockHash',
                  'chain_getFinalisedHead',
                  'chain_getFinalizedHead',
                  'chain_getHead',
                  'chain_getHeader',
                  'chain_getRuntimeVersion',
                  'chain_subscribeAllHeads',
                  'chain_subscribeFinalisedHeads',
                  'chain_subscribeFinalizedHeads',
                  'chain_subscribeNewHead',
                  'chain_subscribeNewHeads',
                  'chain_subscribeRuntimeVersion',
                  'chain_unsubscribeAllHeads',
                  'chain_unsubscribeFinalisedHeads',
                  'chain_unsubscribeFinalizedHeads',
                  'chain_unsubscribeNewHead',
                  'chain_unsubscribeNewHeads',
                  'chain_unsubscribeRuntimeVersion',
                  'childstate_getKeys',
                  'childstate_getStorage',
                  'childstate_getStorageHash',
                  'childstate_getStorageSize',
                  'grandpa_proveFinality',
                  'grandpa_roundState',
                  'grandpa_subscribeJustifications',
                  'grandpa_unsubscribeJustifications',
                  'offchain_localStorageGet',
                  'offchain_localStorageSet',
                  'payment_queryInfo',
                  'state_call',
                  'state_callAt',
                  'state_getKeys',
                  'state_getKeysPaged',
                  'state_getKeysPagedAt',
                  'state_getMetadata',
                  'state_getPairs',
                  'state_getReadProof',
                  'state_getRuntimeVersion',
                  'state_getStorage',
                  'state_getStorageAt',
                  'state_getStorageHash',
                  'state_getStorageHashAt',
                  'state_getStorageSize',
                  'state_getStorageSizeAt',
                  'state_queryStorage',
                  'state_queryStorageAt',
                  'state_subscribeRuntimeVersion',
                  'state_subscribeStorage',
                  'state_unsubscribeRuntimeVersion',
                  'state_unsubscribeStorage',
                  'subscribe_newHead',
                  'sync_state_genSyncSpec',
                  'system_accountNextIndex',
                  'system_addReservedPeer',
                  'system_chain',
                  'system_chainType',
                  'system_dryRun',
                  'system_dryRunAt',
                  'system_health',
                  'system_localListenAddresses',
                  'system_localPeerId',
                  'system_name',
                  'system_networkState',
                  'system_nodeRoles',
                  'system_peers',
                  'system_properties',
                  'system_removeReservedPeer',
                  'system_syncState',
                  'system_version',
                  'unsubscribe_newHead',
                ],
                version: 1,
              },
              id: request.id,
            }),
          )
          break
        case 'state_getMetadata':
          const resp = require('./metadata.json')
          socket.send(
            JSON.stringify({
              ...resp,
              id: request.id,
            }),
          )
          break
        case 'state_subscribeStorage':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              result: 'LPmK6g64NUzRjvXh',
              id: request.id,
            }),
          )
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'state_storage',
              params: {
                result: {
                  block: '0xcbd939f5d9bac6250595be81d6b034d613dab3e3192b7d15d4aa45e73507826b',
                  changes: [
                    [
                      '0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9c021e7ed85cf4ca2f1fbd56f1f089c1e35516ed61a88766c2014c1fcdfcc4a9f6d64ab21302cb647a4ec90a0c0e7b9c4',
                      '0x1d00000000000000e3494d220f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                    ],
                  ],
                },
                subscription: 'LPmK6g64NUzRjvXh',
              },
            }),
          )
          break
        case 'chain_getHeader':
          if (request.params && request.params.length > 0) {
            socket.send(
              JSON.stringify({
                jsonrpc: '2.0',
                result: {
                  digest: {
                    logs: [
                      '0x0642414245340206000000a0b3f30f00000000',
                      '0x0542414245010122c6654b14ebbb8fb84c827ee64042c027c385d1978c8d1b313668203c09b416bae2d8f55ae33a5cca0aaf46bacb105070a8f97ba3b48ccb37f9f870dff56e85',
                    ],
                  },
                  extrinsicsRoot: '0x610aa0f0a35723a999f0d6bb7fc110f606e8c249295d3acb044e43977e150cf6',
                  number: '0x3004b7',
                  parentHash: '0x9ca15ecc6de27327a87e896a098c4db86722e842b02a5b1404d658c505da8f6d',
                  stateRoot: '0xdaf550455c9ab7ee56d894c32b08f4e5779cd42bd42f4a2a9aca2dc244c24e60',
                },
                id: request.id,
              }),
            )
          } else {
            socket.send(
              JSON.stringify({
                jsonrpc: '2.0',
                result: {
                  digest: {
                    logs: [
                      '0x0642414245b5010109000000a2b3f30f00000000f88b4387dfc56c9ce0662fe66edad765a5b25db68e5d1e6277597b957454ca078f6b12ddc64bbc03b5396c0f459ddd4d8fd27f7569e5e3ed92e63da1530e6a0a690c23f19bdbaf46419a0d6341a18b783d32aaf49a9ec0966f3a92b26562cf03',
                      '0x05424142450101c8f3f0ebe937b5e394564d1c34eff6712c6b718a62d1ee659f46831ce57a591658d21e4f0cec028ed51d71d7ec0f1d495b375465905bbb75e3f52852ef564088',
                    ],
                  },
                  extrinsicsRoot: '0xa3d094474f8d900721a672dbef302965a621014898d2e9710fb409e9a8ea7d7a',
                  number: '0x3004b9',
                  parentHash: '0x2cbf74a1fa12be5a632ee338e0ad885f5b6ae10704fefb45c975d5fcec8e0aea',
                  stateRoot: '0x875e213a42452e7a3e4b615b95e984935c5a32a8eff017e47cc2dbbc3ab806ee',
                },
                id: request.id,
              }),
            )
          }
          break
        case 'chain_getFinalizedHead':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              result: '0x6f044ed2c9f07314f7798fff7fdfc49f8541db26082aa035ac7fb22197590ad9',
              id: request.id,
            }),
          )
          break
        case 'chain_getBlock':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              result: {
                block: {
                  extrinsics: ['0x280403000b50c7b4da7501'],
                  header: {
                    digest: {
                      logs: [
                        '0x0642414245b50103dd000000737cf30f00000000649dcf6c0c9eceef3593224eaf9acd5d1bf2447c09ec2c8b1cd600d4fde80c5b4cf8072673d2abd01b0c49d21b4e412c8c1c95397e930a084f572a2e8c2b2208c09bae119f68c2c07acd631ca3804a78444dde748170501cfb2701b9528d3204',
                        '0x05424142450101240726dc50d778c4a83e2cca6e351f6a5ac64d31bbe994d81b04d884ab771319e39a544826152e3a1d987a3494860427ea01659fda4e8ddbab4c324c1fb62384',
                      ],
                    },
                    extrinsicsRoot: '0x1af6d57fd2148bc783c4c668cf846602d3b4894d5d0b79a5ea8ef7e3b18fb1e4',
                    number: '0x267219',
                    parentHash: '0xfbf79103eeef316293925ad3f323efcf5b4304814ffe55e11c45baee7b312e16',
                    stateRoot: '0x8d12e462984f49917a3db10c4446eac2d9ecf04a027647866c4fda1a3cfbb8ce',
                  },
                },
                justification: null,
              },
              id: request.id,
            }),
          )
          break
        case 'payment_queryInfo':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              result: {
                class: 'normal',
                weight: 217238000,
                partialFee: 15000000001,
              },
              id: request.id,
            }),
          )
          break
        case 'account_nextIndex':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              result: 18,
              id: request.id,
            }),
          )
          break
        case 'author_submitExtrinsic':
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              result: '0xdd227d44f1ed2e5b82e38daf699f66fc5ea28f1e104167b19d587a2363190ee9',
              id: request.id,
            }),
          )
          break
        default:
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              error: {
                code: 0,
                message: 'error',
              },
              id: request.id,
            }),
          )
          break
      }
    })
  })

  return scope
}

export { mockWs }
