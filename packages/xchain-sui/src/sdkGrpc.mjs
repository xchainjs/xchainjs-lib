// Load the gRPC core by file path, not `@mysten/sui/grpc`.
// That barrel imports every generated protobuf type. Node's exports map blocks
// the file path as a package subpath, so this relative import is the bypass.
import { GrpcCoreClient } from '../../../node_modules/@mysten/sui/dist/grpc/core.mjs'
import { GrpcWebFetchTransport, withClientProtocolVersion } from '../../../node_modules/@mysten/sui/dist/grpc/transport.mjs'
import { LedgerServiceClient } from '../../../node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/ledger_service.client.mjs'
import { StateServiceClient } from '../../../node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/state_service.client.mjs'
import { TransactionExecutionServiceClient } from '../../../node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/transaction_execution_service.client.mjs'

/**
 * gRPC core wired to the three services this package calls: ledger, state, and
 * transaction execution. Subscriptions, forking, name service, Move packages,
 * and signature verification stay out of the graph.
 *
 * @param {string} baseUrl
 * @param {'mainnet' | 'testnet'} network
 */
export function createGrpcCoreClient(baseUrl, network) {
  const transport = withClientProtocolVersion(new GrpcWebFetchTransport({ baseUrl }))
  return new GrpcCoreClient({
    client: {
      ledgerService: new LedgerServiceClient(transport),
      stateService: new StateServiceClient(transport),
      transactionExecutionService: new TransactionExecutionServiceClient(transport),
    },
    network,
  })
}
