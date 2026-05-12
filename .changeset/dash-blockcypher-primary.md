---
'@xchainjs/xchain-dash': patch
---

Route Dash balance, transaction list, single-transaction lookups, and broadcast through the configured `dataProviders` instead of calling `insight.dash.org/insight-api` directly. Insight has been placed behind a Cloudflare bot challenge that returns HTTP 403 to programmatic clients. Blockcypher is now ordered ahead of Bitgo in `defaultDashParams.dataProviders` so reads and broadcasts hit a working provider by default; Bitgo remains as a fallback. `transfer` and `transferMax` in `ClientKeystore` and `ClientLedger` now call the inherited `broadcastTx` from `UTXOClient` rather than posting to `nodeUrls`. The mainnet/stagenet explorer URLs (`getExplorerUrl`, `getExplorerAddressUrl`, `getExplorerTxUrl`) have moved from `insight.dash.org/insight` to `blockchair.com/dash`, which is more reliable and aligns with what consumers already use elsewhere. The transfer flow's UTXO fetch path is unchanged.
