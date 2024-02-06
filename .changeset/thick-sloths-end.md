---
'@xchainjs/xchain-mayachain': major
---

Breaking changes
  - `getPrivateKey` is now async and response is Uint8Array type
  - `getPubKey` is now async and response is Uint8Array type
  - `getDepositTransaction` is deprecated in favour of `getTransactionData`
  - `fetchTransaction` removed
  - `setClientUrl` removed
  - `getClientUrl` removed
  - `setExplorerUrls` removed
  - `getCosmosClient` removed
  - `setChainId` removed
  - `getChainId` removed