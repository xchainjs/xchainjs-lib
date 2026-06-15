---
'@xchainjs/zcash-js': patch
'@xchainjs/xchain-utxo-providers': patch
'@xchainjs/xchain-zcash': patch
---

Fix Zcash broadcasts failing after the NU6.2 network upgrade (activated June 3, 2026 at block height 3364600). The consensus branch ID used to sign v5 transactions was hardcoded to the NU6.1 value (`0x4dec4df0`), so post-upgrade nodes rejected every spend with an HTTP 400. `signAndFinalize` now accepts an optional `consensusBranchId` (defaulting to the NU6.2 value `0x5437f330`), and the Zcash client fetches the live value from the Nownodes Blockbook backend status (`backend.consensus.nextblock`) before signing, falling back to the default if the node is unreachable. This keeps transactions valid across future consensus upgrades without a library change.
