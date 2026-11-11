---
'@xchainjs/xchain-aggregator': minor
---

Chainflip: upgrade @chainflip/sdk to 2.3.2 and add BSC support

Bumps the Chainflip swap SDK from 2.2.1 to 2.3.2 (and its `@chainflip/*` 2.3.x sub-dependencies)
and adds the `BSC` <-> `Bsc` chain mapping to the Chainflip protocol, so native BNB (`BSC.BNB`) and
BSC USDT (`BSC.USDT-0x55d398326f99059fF775485246999027B3197955`, 18 decimals) are recognised for
quotes and deposit channels. Chains the SDK reports without an xchainjs mapping are still dropped.

Chainflip token matching is now bound to the contract address on every chain: an xchainjs token
only resolves to a Chainflip asset when its contract matches the SDK's contract (case-insensitive),
and a native Chainflip asset only matches a native xchainjs asset. Previously ticker + chain was
enough, so a look-alike token (for example `BSC.USDT-<other contract>`) or a bare `ETH.USDT` would
resolve to the real Chainflip asset. Such assets now report as unsupported.
