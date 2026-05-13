---
'@xchainjs/xchain-mayachain-amm': patch
---

Add Cardano (ADA) address validation to `validateAddress` in `mayachain-amm/utils.ts`. Previously, calling `estimateSwap` with a destination on ADAChain threw `Error: Unsupported chain` from the default case of the switch before the quote ever reached MAYAChain's REST API, even though MAYAChain has live ADA pools. The switch now resolves an ADAChain destination by instantiating an `AdaClient` from `@xchainjs/xchain-cardano` (added as a dependency) and delegating to its `validateAddress`. This unblocks ETH→ADA (and other →ADA) quoting; full deposit construction from a Cardano sender via `doSwap` is still not wired in this package and remains a follow-up.
