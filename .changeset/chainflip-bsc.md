---
'@xchainjs/xchain-aggregator': minor
---

Chainflip: upgrade @chainflip/sdk to 2.3.2 and add BSC support (mainnet only)

Bumps the Chainflip swap SDK from 2.2.1 to 2.3.2 (exact pin, with its `@chainflip/*` 2.3.x
sub-dependencies) and adds the `BSC` <-> `Bsc` chain mapping to the Chainflip protocol. Native BNB
(`BSC.BNB`, 18 decimals) and BSC USDT (`BSC.USDT-0x55d398326f99059fF775485246999027B3197955`,
18 decimals) are supported for quotes, deposit channels and swaps. Chains the SDK reports without
an xchainjs mapping are still dropped.

BSC identity is strict: `BscUsdt` only matches the xchainjs BSC token with that contract
(case-insensitive), and native `Bnb` only matches the native `BSC.BNB` asset. Matching for the
other Chainflip chains (ETH, ARB, SOL, TRON) is unchanged.

BSC is supported on mainnet only. On stagenet (Chainflip `perseverance`, which runs on BSC testnet
while the xchainjs BSC client on stagenet uses BSC mainnet) BSC is left out of `getSupportedChains`,
`isAssetSupported` returns `false`, and `estimateSwap`, `openDepositChannel` and `doSwap` throw
`ChainflipUnsupportedNetworkError` for BSC as source or destination before any SDK, backend, broker
or wallet call. `doSwap` also rejects a BSC swap when the wallet is not on mainnet. xchainjs testnet
still has no Chainflip network, as before.
