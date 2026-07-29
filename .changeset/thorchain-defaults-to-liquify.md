---
'@xchainjs/xchain-thorchain': patch
'@xchainjs/xchain-client': patch
'@xchainjs/xchain-thorchain-query': patch
'@xchainjs/xchain-midgard': patch
'@xchainjs/xchain-midgard-query': patch
'@xchainjs/xchain-aggregator': patch
---

Point mainnet THORChain public defaults at the Liquify gateway after `*.thorchain.network` hosts stopped resolving (DNS failure for `rpc`, `thornode`, and `midgard`).

Defaults are now:
- RPC: `https://gateway.liquify.com/chain/thorchain_rpc`
- THORNode: `https://gateway.liquify.com/chain/thorchain_api`
- Midgard: `https://gateway.liquify.com/chain/thorchain_midgard`

Dead `*.thorchain.network` primaries are removed rather than kept as fallbacks. Consumers that pass their own `clientUrls` / thornode / midgard configs are unaffected (including authenticated Liquify portal URLs).
