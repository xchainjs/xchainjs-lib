---
'@xchainjs/xchain-evm': patch
'@xchainjs/xchain-evm-providers': patch
'@xchainjs/xchain-arbitrum': patch
'@xchainjs/xchain-base': patch
---

Reject a positive priority fee when the block has no base fee and no max fee is set, before the transaction is signed.

Drop unused EVM helpers and share one Etherscan address helper and ERC-20 ABI. Point Arbitrum testnet at Sepolia. Base default-exports its keystore client, declares the Ledger transport dependency, and no longer exports the unused `BASE_DECIMAL` constant.
