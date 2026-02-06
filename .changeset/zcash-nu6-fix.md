---
"@xchainjs/xchain-zcash": minor
---

Update xchain-zcash to use @xchainjs/zcash-js with NU6.1 consensus branch ID support

- Changed dependency from @mayaprotocol/zcash-js to @xchainjs/zcash-js
- NU6.1 consensus branch ID (0x4DEC4DF0) fixes transaction broadcasting since Nov 24, 2025
- Browser-compatible: replaced blake2b-wasm with @noble/hashes

Note: @xchainjs/zcash-js is a new package (1.0.0) and will be published alongside this update.

Fixes GitHub issue #1592
