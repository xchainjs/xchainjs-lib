# `@xchainjs/xchain-thorchain`

Thorchain Module for XChainJS Clients

## Installation

```
yarn add @xchainjs/xchain-thorchain
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-thorchain`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util @xchainjs/xchain-cosmos axios @cosmos-client/core bech32-buffer
```

Important note: Make sure to install same version of `@cosmos-client/core` as `xchain-thorchain` is using (currently `@cosmos-client/core@0.45.1` ). In other case things might break.


## Documentation

### [`xchain thorchain`](http://docs.xchainjs.org/xchain-client/xchain-thorchain/)
[`How xchain-thorchain works`](http://docs.xchainjs.org/xchain-client/xchain-thorchain/how-it-works.html)\
[`How to use xchain-thorchain`](http://docs.xchainjs.org/xchain-client/xchain-thorchain/how-to-use.html)


For more examples check out tests in `./__tests__/client.test.ts`

## Service Providers

This package uses the following service providers:

| Function                    | Service        | Notes                                                               |
| --------------------------- | -------------- | ------------------------------------------------------------------- |
| Balances                    | Cosmos RPC     | https://cosmos.network/rpc/v0.37.9 (`GET /bank/balances/{address}`) |
| Transaction history         | Tendermint RPC | https://docs.tendermint.com/master/rpc/#/Info/tx_search             |
| Transaction details by hash | Cosmos RPC     | https://cosmos.network/rpc/v0.37.9 (`GET /txs/{hash}`)              |
| Transaction broadcast       | Cosmos RPC     | https://cosmos.network/rpc/v0.37.9 (`POST /txs`)                    |
| Explorer                    | Thorchain.net  | https://thorchain.net                                               |

Rate limits: No

## Extras

## Creating protobuffer typescript bindings

In order for this library to de/serialize proto3 structures, you can use the following to create bindings

1. `git clone https://gitlab.com/thorchain/thornode`
2. run the following (adjust the paths acordingly) to generate a typecript file for MsgDeposit
   ```bash
   yarn run pbjs -w commonjs  -t static-module  <path to repo>/thornode/proto/thorchain/v1/x/thorchain/types/msg_deposit.proto <path to repo>/thornode/proto/thorchain/v1/common/common.proto <path to repo>/thornode/proto/thorchain/v1/x/thorchain/types/msg_send.proto <path to repo>/thornode/third_party/proto/cosmos/base/v1beta1/coin.proto -o src/types/proto/MsgCompiled.js
   ```
3. run the following to generate the .d.ts file
   ```bash
   yarn run pbts src/types/proto/MsgCompiled.js -o src/types/proto/MsgCompiled.d.ts
   ```

Alternatively, you can run the convenience script: `genMsgs.sh`, which will overwrite the proto/js files in types/proto. This should only be done and checked in if changes were made to the upstream Msg in the THORNode repo. 


### Setting Headers for Nine Realms endpoints

If you plan on using the publically accessible endpoints provided by Nine Realms(listed below), ensure that you add a valid 'x-client-id' to all requests

- https://midgard.ninerealms.com
- https://haskoin.ninerealms.com (BTC/BCH/LTC)
- https://thornode.ninerealms.com 

Example

```typescript
import cosmosclient from '@cosmos-client/core'
import axios from 'axios'
import { register9Rheader } from '@xchainjs/xchain-util'

register9Rheader(axios)
register9Rheader(cosmosclient.config.globalAxios)
```

For a complete example please see this [test](https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-thorchain-amm/__e2e__/wallet.e2e.ts) for a complete example