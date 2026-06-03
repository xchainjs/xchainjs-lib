---
'@xchainjs/xchain-mayachain-amm': patch
---

Fix ADA (Cardano) swap execution: `makeNonProtocolAction` no longer calls `wallet.getFeeRates` for Cardano. The Cardano client derives its fee internally from on-chain protocol params and has no per-byte fee rate, so the call threw `getFeeRates method not supported in ADA chain` and the swap could not be broadcast. ADA now takes the same no-feeRate transfer path as BFT/Cosmos chains. Follow-up to the ADA swap support added in #1700.
