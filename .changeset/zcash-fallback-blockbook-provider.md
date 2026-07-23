---
'@xchainjs/xchain-zcash': patch
---

Add an optional fallback Blockbook data provider so a single-provider outage (e.g. a nownodes 502) no longer blocks ZEC broadcasts or the consensus branch ID fetch. Configured via `ZEC_FALLBACK_BLOCKBOOK_URL` (and optional `ZEC_FALLBACK_BLOCKBOOK_API_KEY`) and disabled when unset; the default client now round-robins nownodes → fallback.
