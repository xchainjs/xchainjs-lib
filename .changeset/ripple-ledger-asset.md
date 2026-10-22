---
'@xchainjs/xchain-ripple': patch
---

Ledger transfers reject any asset other than XRP. The payment amount was always encoded as XRP drops, so a trust-line asset was paid in XRP.
