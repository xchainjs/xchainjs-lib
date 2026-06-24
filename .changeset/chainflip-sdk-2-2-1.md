---
'@xchainjs/xchain-aggregator': minor
---

Chainflip: upgrade @chainflip/sdk to 2.2.1 and add Tron support

Bumps the Chainflip swap SDK from 2.1.1 to 2.2.1 (and its `@chainflip/*` 2.2.x
sub-dependencies) and wires up the newly available Tron chain in the Chainflip protocol:
`TRON` <-> `Tron` chain mapping is added alongside the existing BTC/ETH/ARB/SOL entries, so
TRX and Tron USDT are now recognised as supported assets.

The SDK 2.2.x moved its shared types behind subpath `exports`, so the aggregator's TypeScript
config now uses `moduleResolution: "bundler"` to resolve them — restoring full type-checking of
the Chainflip integration (previously the types silently degraded to `any`). The removed 2.2.x
APIs (`SwapSDKOptions.enabledFeatures.dca`, deprecated `depositChannel` status fields,
`getBoostLiquidity` boost tiers) are not used by this package.
