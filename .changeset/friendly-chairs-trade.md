---
'@xchainjs/xchain-wallet': patch
---

The parameters and the return type of the method `getBalances` have been updated. Although the parameter `assets` remains optional, it is now a dictionary where the keys are the chains and the values are the assets of the chain. The response has also been updated, and although it remains as a dictionary where the keys are the chains, the value has a property to let the user if the balances of a chain could be retrieved or not.
