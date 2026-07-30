---
'@xchainjs/xchain-sui': minor
---

Migrate `@xchainjs/xchain-sui` off deprecated Sui Foundation JSON-RPC fullnodes.

Defaults now use **gRPC** (`fullnode.*.sui.io`) for balances, fees, coins, and execution, and **GraphQL** (`graphql.*.sui.io`) for transaction history. Existing `clientUrls` pointing at Foundation fullnodes continue to work as gRPC base URLs.

Optional `transport: 'jsonRpc'` remains for private nodes that still enable JSON-RPC. New optional `grpcUrls` / `graphqlUrls` params allow overriding each endpoint.
