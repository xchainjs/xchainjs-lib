# `@xchainjs/xchain-ripple`

## Modules

- `client` - Custom client for communicating with XRPL using [xrpl](https://www.npmjs.com/package/xrpl)

## Installation

```
yarn add @xchainjs/xchain-ripple
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-ripple`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util
```

## Usage

### Basic Transfer

```typescript
import { ClientKeystore as Client, AssetXRP } from '@xchainjs/xchain-ripple'
import { assetToBase, assetAmount } from '@xchainjs/xchain-util'

const client = new Client({ phrase: 'your mnemonic phrase' })

// Simple transfer
const txHash = await client.transfer({
  asset: AssetXRP,
  amount: assetToBase(assetAmount('1', 6)), // 1 XRP
  recipient: 'rDestinationAddress...',
})
```

### Transfer with Destination Tag

For addresses that require destination tags (exchanges, custodians, etc.), you can include a destination tag:

```typescript
// Transfer with destination tag
const txHash = await client.transfer({
  asset: AssetXRP,
  amount: assetToBase(assetAmount('1', 6)),
  recipient: 'rDestinationAddress...',
  destinationTag: 12345, // Required for some exchanges
  memo: 'Payment memo',
})
```

### Checking if Address Requires Destination Tag

You can check if a destination address requires a destination tag before sending:

```typescript
const requiresTag = await client.requiresDestinationTag('rDestinationAddress...')
if (requiresTag) {
  console.log('This address requires a destination tag')
}
```

### Destination Tag Validation

The client includes utilities for validating destination tags:

```typescript
import { validateDestinationTag, parseDestinationTag } from '@xchainjs/xchain-ripple'

// Validate a destination tag
const isValid = validateDestinationTag(12345) // true
const isInvalid = validateDestinationTag(-1) // false

// Parse destination tag from string or number
const parsed = parseDestinationTag('12345') // 12345
const invalid = parseDestinationTag('invalid') // undefined
```

## Important Notes

- **Destination Tags**: When sending to exchanges or services that host multiple accounts under one address, always include the appropriate destination tag to ensure proper crediting.
- **RequireDestTag Flag**: Addresses with the `lsfRequireDestTag` flag set will reject payments without destination tags. The client automatically checks for this flag and throws an error if a destination tag is required but not provided.
- **Destination Tag Range**: Valid destination tags are integers between 0 and 4,294,967,295 (2^32 - 1).
