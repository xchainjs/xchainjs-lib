---
'@xchainjs/xchain-monero': patch
---

Stop using the in-process RingCT builder for `transfer` (wallet-rpc only), checksum-validate addresses, point stagenet at stagenet explorers/daemons, and scale fee estimates by typical tx weight.
