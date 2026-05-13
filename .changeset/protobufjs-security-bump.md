---
'@xchainjs/xchain-cosmos': patch
'@xchainjs/xchain-mayachain': patch
'@xchainjs/xchain-thorchain': patch
---

Bump `protobufjs` from `7.5.5` to `7.5.8` to address GHSA-66ff-xgx4-vchm (high-severity code injection through bytes field defaults in generated `toObject` code). All versions `<=7.5.5` are vulnerable; the issue is fixed in `7.5.6` and forward. `7.5.8` is the latest stable 7.x patch — no API changes, no behavioral changes in our usage.
