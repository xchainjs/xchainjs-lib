---
'@xchainjs/xchain-client': patch
'@xchainjs/xchain-thorchain': patch
'@xchainjs/xchain-thornode': patch
'@xchainjs/xchain-thorchain-query': patch
'@xchainjs/xchain-midgard': patch
'@xchainjs/xchain-midgard-query': patch
---

Point THORChain endpoint defaults at the new official public gateway hosted at `*.thorchain.network` (announced in xchainjs/xchainjs-lib#1665). Mainnet defaults now use `https://thornode.thorchain.network`, `https://midgard.thorchain.network`, and `https://rpc.thorchain.network` as the primary URLs, with the existing Liquify gateway (`gateway.liquify.com`) retained as a fallback in packages that support multiple base URLs (`xchain-thorchain`, `xchain-thorchain-query`, `xchain-midgard-query`). The single-URL constants in `xchain-thornode` (`THORNODE_API_URL`) and `xchain-midgard` (`MIDGARD_API_URL`) are switched to the new gateway, as is the `MAINNET_THORNODE_API_BASE` used by `BaseXChainClient.thornodeAPIGet` in `xchain-client`. Consumers that pass their own URLs are unaffected.
