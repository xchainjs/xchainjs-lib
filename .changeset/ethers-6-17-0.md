---
'@xchainjs/xchain-arbitrum': patch
'@xchainjs/xchain-avax': patch
'@xchainjs/xchain-base': patch
'@xchainjs/xchain-bsc': patch
'@xchainjs/xchain-ethereum': patch
'@xchainjs/xchain-evm': patch
'@xchainjs/xchain-evm-providers': patch
'@xchainjs/xchain-mayachain-amm': patch
'@xchainjs/xchain-thorchain-amm': patch
'@xchainjs/xchain-wallet': patch
---

Bump `ethers` to ^6.17.0 so these packages resolve a single ethers 6.17 install. `EtherscanProviderV2` still accepts `AbstractProvider` from that same copy.
