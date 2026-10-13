---
'@xchainjs/xchain-sui': patch
---

Load gRPC through the ledger, state, and transaction-execution services, and send GraphQL as plain query strings. The client no longer imports the `@mysten/sui/grpc` and `@mysten/sui/graphql` barrels. Legacy JSON-RPC still loads on first use. GraphQL responses that include errors are rejected, and a hung history poll aborts at its deadline.
