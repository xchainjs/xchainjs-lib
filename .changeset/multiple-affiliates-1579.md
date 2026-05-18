---
'@xchainjs/xchain-thorchain-amm': minor
'@xchainjs/xchain-mayachain-amm': minor
'@xchainjs/xchain-thorchain-query': minor
'@xchainjs/xchain-mayachain-query': minor
---

Add multi-affiliate support to swap quotes (#1579). `QuoteSwapParams` now accepts an `affiliates?: Affiliate[]` field carrying `Array<{ address: string; bps: number }>`. THORChain/MAYAChain's `/quote/swap` endpoint requires per-affiliate basis points (counts must match — the protocol does not auto-expand a shared bps), so the API accepts per-affiliate pairs only. When `affiliates` is set, the query layer joins both arrays into the slash-delimited form the protocol expects (`affiliate=a1/a2/a3`, `affiliate_bps=10/20/30`). The singular `affiliateAddress` / `affiliateBps` fields remain supported for backwards compatibility but are mutually exclusive with `affiliates`. Also tightens the single-affiliate `affiliateBps` validator to the real per-protocol caps — 1000 on THORChain, 500 on MAYAChain (previously both packages allowed up to 10000, wider than either chain accepts; the chain would reject those values at execution time).
