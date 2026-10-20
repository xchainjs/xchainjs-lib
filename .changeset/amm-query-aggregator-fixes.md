---
'@xchainjs/xchain-thorchain-query': patch
'@xchainjs/xchain-thorchain-amm': patch
'@xchainjs/xchain-mayachain-query': patch
'@xchainjs/xchain-mayachain-amm': patch
'@xchainjs/xchain-aggregator': patch
'@xchainjs/xchain-midgard-query': patch
'@xchainjs/xchain-mayamidgard-query': patch
---

Fix quote, fee, and deposit bugs across the THORChain and MAYAChain query, AMM, and aggregator packages.

THORChain inbound and outbound fees now use each chain's native decimals, including BASE priced in mwei and EVM gas in wei. Empty affiliate names are omitted from quotes, while a named affiliate with 0 bps is still sent. RUNE-only liquidity sends RUNE, and a withdraw carrier is at least the chain dust amount. MAYA pool prices use human balances, ZEC deposits skip fee-rate lookups, and the aggregator only executes a quote that can swap.
