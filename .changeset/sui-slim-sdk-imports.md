---
'@xchainjs/xchain-sui': patch
---

Send Sui GraphQL history as plain query strings instead of through `SuiGraphQLClient`. Responses that include errors are rejected, and a hung history poll aborts at its deadline. Legacy JSON-RPC still loads on first use.
