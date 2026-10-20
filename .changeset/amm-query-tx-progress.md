---
'@xchainjs/xchain-thorchain-query': patch
'@xchainjs/xchain-mayachain-query': patch
'@xchainjs/xchain-midgard-query': patch
---

Read a THORChain swap limit from the amount before the streaming fields, and treat the affiliate field as basis points. A swap or withdraw with no outbound no longer throws. MAYA quotes omit an empty affiliate. Saver value uses the redeem amount Midgard reports.
