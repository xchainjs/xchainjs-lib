---
'@xchainjs/xchain-mayachain-query': patch
'@xchainjs/xchain-thorchain-query': patch
'@xchainjs/xchain-mayachain': patch
'@xchainjs/xchain-thorchain': patch
'@xchainjs/xchain-arbitrum': patch
'@xchainjs/xchain-ethereum': patch
'@xchainjs/xchain-litecoin': patch
'@xchainjs/xchain-bitcoin': patch
'@xchainjs/xchain-cosmos': patch
'@xchainjs/xchain-kujira': patch
'@xchainjs/xchain-wallet': patch
'@xchainjs/xchain-avax': patch
'@xchainjs/xchain-base': patch
'@xchainjs/xchain-doge': patch
'@xchainjs/xchain-util': patch
'@xchainjs/xchain-bsc': patch
'@xchainjs/xchain-evm': patch
---

Fix ESM (ECMAScript Module) compatibility issues

- Update bignumber.js to 9.1.2 for proper ESM support
- Change bitcore-lib-cash imports from namespace to default imports for ESM compatibility
- Change @dashevo/dashcore-lib imports from namespace to default imports for ESM compatibility
- Add .js extensions to coinselect/accumulative imports for ESM
- Add .js extensions to cosmjs-types imports for ESM
- Update module type declarations for ESM compatibility
- Regenerate protobuf files with correct ESM import patterns

This enables the library to work properly in ESM environments (Node.js type: "module", modern bundlers, etc.)
