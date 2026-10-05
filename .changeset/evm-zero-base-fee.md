---
'@xchainjs/xchain-evm': patch
---

Keep EIP-1559 maxFeePerGas when the latest block reports a base fee of 0. A zero base fee is a real fee, so a tip-only transfer sets maxFeePerGas to the tip instead of leaving it unset.
