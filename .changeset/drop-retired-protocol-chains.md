---
'@xchainjs/xchain-thorchain-query': major
'@xchainjs/xchain-thorchain-amm': major
'@xchainjs/xchain-mayachain-query': major
'@xchainjs/xchain-mayachain-amm': major
'@xchainjs/xchain-aggregator': patch
---

Drop protocol chains that THORChain and MAYAChain no longer list. THORChain query and AMM no longer treat BNB beacon, Sui, or Maya as swap chains. MAYAChain query and AMM no longer treat Kujira or Radix as swap chains. Removed exports include `BNBChain`, `SUIChain`, `AssetSUI`, `AssetMAYA`, `MAYAChain`, `KujiraAsset`, `KujiraChain`, `XdrAsset`, `XdrChain`, and `isRadixChain`.
