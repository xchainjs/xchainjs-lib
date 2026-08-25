---
"@xchainjs/xchain-aggregator": patch
---

Fix Chainflip `openDepositChannel` when using `brokerUrl`: `@chainflip/sdk` broker path omits `estimatedDepositChannelExpiryTime`, which previously aborted after the channel was already opened. Fall back to a ~24h TTL (Chainflip channel lifetime) so broker-mode submits can proceed.
