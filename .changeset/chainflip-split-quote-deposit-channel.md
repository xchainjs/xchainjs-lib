---
'@xchainjs/xchain-aggregator': major
---

**Breaking (Chainflip):** `estimateSwap` no longer opens a deposit channel.

Previously, providing `fromAddress` + `destinationAddress` called `requestDepositAddressV2` on every quote refresh, creating short-lived channels that could expire before the user deposited.

**Migration:**
1. Use `estimateSwap` for quote refresh only (`toAddress` / `depositChannelId` are empty for Chainflip; `canSwap` means a usable quote exists).
2. Immediately before broadcast, call `Aggregator.requestChainflipDepositAddress` (or `ChainflipProtocol.openDepositChannel`) to get `depositAddress`, `depositChannelId`, and `expiresAt`.
3. Transfer to that address, or use `doSwap` which opens one channel then sends.

Do not cache deposit addresses across channel expiry.
