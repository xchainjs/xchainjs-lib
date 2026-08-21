---
'@xchainjs/xchain-aggregator': major
---

**Breaking (Chainflip):** `estimateSwap` no longer opens a deposit channel.

Previously, providing `fromAddress` + `destinationAddress` called `requestDepositAddressV2` on every quote refresh, creating short-lived channels that could expire before the user deposited.

**Migration:**
1. Use `estimateSwap` for quote refresh only (`toAddress` / `depositChannelId` are empty for Chainflip; `canSwap` means a usable quote exists — not “ready to send”).
2. Immediately before broadcast, call `Aggregator.requestChainflipDepositAddress` (or `ChainflipProtocol.openDepositChannel`) to get `depositAddress`, `depositChannelId`, `expiresAt`, and the quote snapshot bound to that channel.
3. Transfer to that address, or use `doSwap` which opens one channel then sends (prefer the explicit open API when you must track expiry around Ledger signing).

Do not cache deposit addresses across channel expiry. Deposit must be **observed** by Chainflip before expiry (broadcast-before-expiry is not enough for slow EVM inclusion).
