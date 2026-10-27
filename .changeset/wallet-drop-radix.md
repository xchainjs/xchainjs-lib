---
'@xchainjs/xchain-wallet': patch
---

Drop the `@xchainjs/xchain-radix` dependency. `transfer` no longer forwards `methodToCall`. Call the Radix client directly for that field.
