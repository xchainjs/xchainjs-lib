---
'@xchainjs/xchain-cardano': patch
---

Emit the swap memo as CIP-20 transaction-message metadata (label `674`, shape `{"msg": [chunks]}`) inside Conway-era (CBOR tag 259) auxiliary data. Previously the memo was written to label `674` as a bare text value, which is not CIP-20, so MAYA's Cardano observer could not parse it and memo-carrying swaps/deposits were refunded with an empty memo. The memo is now split into chunks of at most 64 UTF-8 bytes (without splitting a multi-byte codepoint) as required for Cardano metadata text values. Verified against successful on-chain ADA->MAYA swaps, which all use label 674 / `msg`.
