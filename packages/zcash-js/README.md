# @xchainjs/zcash-js

Zcash JavaScript library for XChainJS - a fork of @mayaprotocol/zcash-js with critical fixes.

## Key Fixes

### NU6.1 Consensus Branch ID (CRITICAL)

This package includes the updated NU6.1 consensus branch ID (`0x4DEC4DF0`) which activated on November 24, 2025 at block height 3,146,400.

The original @mayaprotocol/zcash-js package uses the outdated NU5 branch ID (`0xc8e71055`), causing all transactions to be rejected by the network with "bad-txns-wrong-version" errors.

### Browser Compatibility

- Replaced `blake2b-wasm` with `@noble/hashes/blake2b` - pure JavaScript implementation that works in browsers
- Uses synchronous hashing instead of async WASM loading
- No Node.js-specific APIs required

## Usage

```typescript
import { buildTx, signAndFinalize, getFee } from '@xchainjs/zcash-js'

// Build an unsigned transaction
const tx = await buildTx(
  currentHeight,
  senderAddress,
  recipientAddress,
  amount, // in satoshis
  utxos,
  true, // isMainnet
  'optional memo'
)

// Sign and finalize
const signedTx = await signAndFinalize(
  currentHeight,
  privateKeyHex,
  tx.inputs,
  tx.outputs
)

// Broadcast the hex-encoded transaction
const txHex = signedTx.toString('hex')
```

## API

### `buildTx(height, from, to, amount, utxos, isMainnet, memo?)`

Creates an unsigned transaction with automatic UTXO selection.

### `signAndFinalize(height, privateKey, utxos, outputs)`

Signs the transaction and returns the serialized transaction buffer.

### `getFee(inputCount, outputCount, memo?)`

Calculates the transaction fee using Zcash's ZIP 317 fee algorithm.

## Network Upgrade History

| Version | Branch ID | Activation |
|---------|-----------|------------|
| NU5 | 0xc8e71055 | May 2022 |
| NU6 | 0xc8e71055 | Nov 2024 |
| NU6.1 | 0x4DEC4DF0 | Nov 24, 2025 |

## License

MIT
