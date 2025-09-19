# `@xchainjs/xchain-tron`

## Modules

- `client` - Custom client for Tron
- `clientKeystore` - Keystore client for Tron

## Installation

```
yarn add @xchainjs/xchain-tron
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-tron`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util
```

## Usage

### Basic Transfer

```typescript
import { ClientKeystore as Client, AssetTRX } from '@xchainjs/xchain-tron'
import { assetToBase, assetAmount } from '@xchainjs/xchain-util'

const client = new Client({ phrase: 'your mnemonic phrase' })

// Simple transfer
const txHash = await client.transfer({
  asset: AssetTRX,
  amount: assetToBase(assetAmount('1', 6)), // 1 TRX
})
```
