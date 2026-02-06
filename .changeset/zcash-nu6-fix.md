---
"@xchainjs/zcash-js": minor
"@xchainjs/xchain-zcash": minor
---

Add @xchainjs/zcash-js package with NU6.1 consensus branch ID support

- Fork of @mayaprotocol/zcash-js with critical fixes
- Updated consensus branch ID from 0xc8e71055 (NU5) to 0x4DEC4DF0 (NU6.1)
- Replaced blake2b-wasm with @noble/hashes for browser compatibility
- Pure JavaScript implementation, no WASM required

Fixes GitHub issue #1592
