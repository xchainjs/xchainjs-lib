---
"@xchainjs/xchain-client": patch
"@xchainjs/xchain-thorchain": patch
"@xchainjs/xchain-thornode": patch
"@xchainjs/xchain-midgard": patch
"@xchainjs/xchain-midgard-query": patch
"@xchainjs/xchain-thorchain-query": patch
"@xchainjs/xchain-thorchain-amm": patch
"@xchainjs/xchain-bitcoincash": patch
"@xchainjs/xchain-util": patch
---

Migrate Nine Realms endpoints to Liquify and updated providers

- Mainnet thornode/midgard/rpc endpoints now use gateway.liquify.com
- Haskoin endpoint updated to api.haskoin.com
- Tracker URL updated to track.thorchain.org
- New THORNODE_API_URL and MIDGARD_API_URL exports (old 9R names deprecated)
- x-client-id header middleware expanded to match liquify.com
- Stagenet defaults cleared (no Liquify stagenet yet)
- Testnet entries marked as deprecated
