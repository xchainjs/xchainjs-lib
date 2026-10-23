---
'@xchainjs/xchain-near': patch
---

Read the NEP-141 transfer hash from the execution outcome. `ft_transfer` returns nothing, so reading the hash from `callFunction` failed after the transfer had already succeeded.
