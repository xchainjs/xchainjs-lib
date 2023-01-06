# `@xchainjs/xchain-mayachain`

Mayachain Module for XChainJS Clients

## Installation

```
yarn add @xchainjs/xchain-mayachain
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-mayachain`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util @xchainjs/xchain-cosmos axios @cosmos-client/core bech32-buffer
```

Important note: Make sure to install same version of `@cosmos-client/core` as `xchain-mayachain` is using (currently `@cosmos-client/core@0.46.1` ). In other case things might break.

## Documentation

### [`xchain mayachain`](http://docs.xchainjs.org/xchain-client/xchain-mayachain/)

[`How xchain-mayachain works`](http://docs.xchainjs.org/xchain-client/xchain-mayachain/how-it-works.html)\
[`How to use xchain-mayachain`](http://docs.xchainjs.org/xchain-client/xchain-mayachain/how-to-use.html)

For more examples check out tests in `./__tests__/client.test.ts`

## Service Providers

This package uses the following service providers:

| Function                    | Service                 | Notes                                                                                 |
| --------------------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| Balances                    | Cosmos RPC              | https://v1.cosmos.network/rpc/v0.45.1 (`GET /cosmos/bank/v1beta1/balances/{address}`) |
| Transaction history         | Tendermint RPC          | https://docs.tendermint.com/v0.34/rpc/#/Info/tx_search                                |
| Transaction details by hash | Cosmos RPC              | https://v1.cosmos.network/rpc/v0.45.1 (`GET /cosmos/tx/v1beta1/txs/{hash}`)           |
| Transaction broadcast       | Cosmos RPC              | https://v1.cosmos.network/rpc/v0.45.1 (`POST /cosmos/tx/v1beta1/txs`)                 |
| Explorer                    | Explorer Mayachain.info | https://explorer.mayachain.info                                                       |

Rate limits: No

## Extras

## Creating protobuffer typescript bindings

In order for this library to de/serialize proto3 structures, you can use the following to create bindings

1. `git clone https://gitlab.com/mayachain/thornode`
2. run the following (adjust the paths acordingly) to generate a typecript file for MsgDeposit
   ```bash
   yarn run pbjs -w commonjs  -t static-module  <path to repo>/thornode/proto/thorchain/v1/x/thorchain/types/msg_deposit.proto <path to repo>/thornode/proto/thorchain/v1/common/common.proto <path to repo>/thornode/proto/thorchain/v1/x/thorchain/types/msg_send.proto <path to repo>/thornode/third_party/proto/cosmos/base/v1beta1/coin.proto -o src/types/proto/MsgCompiled.js
   ```
3. run the following to generate the .d.ts file
   ```bash
   yarn run pbts src/types/proto/MsgCompiled.js -o src/types/proto/MsgCompiled.d.ts
   ```

Alternatively, you can run the convenience script: `genMsgs.sh`, which will overwrite the proto/js files in types/proto. This should only be done and checked in if changes were made to the upstream Msg in the MAYANode repo.
