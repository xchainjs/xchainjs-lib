---
'@xchainjs/xchain-thornode': minor
'@xchainjs/xchain-mayanode': minor
'@xchainjs/xchain-midgard': minor
'@xchainjs/xchain-mayamidgard': minor
'@xchainjs/xchain-thorchain-query': major
'@xchainjs/xchain-mayachain-query': patch
---

Regenerate API clients from latest OpenAPI specs: thornode 3.5.1→3.15.0, mayanode 1.123.0→1.128.0, midgard 2.29.3→2.34.0, mayamidgard 2.10.0→2.16.0.

BREAKING: THORNode 3.15.0 removed loan and saver quote endpoints. `estimateAddSaver`, `estimateWithdrawSaver`, `getLoanQuoteOpen`, and `getLoanQuoteClose` now throw descriptive errors.

MAYAChain query updated to populate new `preferredAsset` and `affiliateCollectorCacao` fields on MAYANameDetails.
