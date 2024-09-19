import {
  FungibleResourcesCollectionItem,
  GatewayApiClient,
  NonFungibleResourcesCollectionItem,
  PublicKey as GatewayPublicKey,
  StateEntityDetailsVaultResponseItem,
  StateEntityFungiblesPageRequest,
  StateEntityFungiblesPageResponse,
  StateEntityNonFungiblesPageRequest,
  StateEntityNonFungiblesPageResponse,
  TransactionPreviewOperationRequest,
  TransactionPreviewResponse,
  TransactionSubmitResponse,
} from '@radixdlt/babylon-gateway-api-sdk'
import {
  Convert,
  Intent,
  ManifestBuilder,
  Message,
  NotarizedTransaction,
  PublicKey,
  RadixEngineToolkit,
  TransactionHash,
  TransactionManifest,
  address,
  bucket,
  decimal,
  enumeration,
  generateRandomNonce,
} from '@radixdlt/radix-engine-toolkit'
import { AssetType, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { AssetXRD, RADIX_ASSET_RESOURCE, RadixChain } from './const'
import { Balance, CompatibleAsset, MethodToCall } from './types/radix'

type PartialTransactionPreviewResponse = {
  receipt: {
    status: 'Succeeded' | 'Failed' | 'Rejected'
    fee_summary: {
      execution_cost_units_consumed: number
      finalization_cost_units_consumed: number
      xrd_total_execution_cost: string
      xrd_total_finalization_cost: string
      xrd_total_royalty_cost: string
      xrd_total_storage_cost: string
      xrd_total_tipping_cost: string
    }
  }
}
/**
 * The main client for the Radix network which is then wrapped by the {Client} adapting it to have
 * a {BaseXChainClient} interface.
 */
export class RadixSpecificClient {
  private innerNetwork: number
  private innerGatewayClient: GatewayApiClient

  constructor(networkId: number) {
    this.innerNetwork = networkId
    this.innerGatewayClient = RadixSpecificClient.createGatewayClient(networkId)
  }

  // #region Getters & Setters
  public set networkId(networkId: number) {
    this.innerNetwork = networkId
    this.innerGatewayClient = RadixSpecificClient.createGatewayClient(networkId)
  }

  public get networkId(): number {
    return this.innerNetwork
  }

  public get gatewayClient(): GatewayApiClient {
    return this.innerGatewayClient
  }
  // #endregion

  // #region Public Methods
  public async currentEpoch(): Promise<number> {
    return this.innerGatewayClient.status.getCurrent().then((status) => status.ledger_state.epoch)
  }

  public async currentStateVersion(): Promise<number> {
    return this.innerGatewayClient.status.getCurrent().then((status) => status.ledger_state.state_version)
  }

  public async fetchBalances(address: string): Promise<Balance[]> {
    const fungibleResources = await this.fetchFungibleResources(address)
    const fungibleBalances = this.convertResourcesToBalances(fungibleResources)
    return fungibleBalances
  }

  public async fetchNFTBalances(address: string): Promise<Balance[]> {
    const nonFungibleResources = await this.fetchNonFungibleResources(address)
    const nonFungibleBalances = this.convertResourcesToBalances(nonFungibleResources)
    return nonFungibleBalances
  }

  private async convertResourcesToBalances(
    resources: FungibleResourcesCollectionItem[] | NonFungibleResourcesCollectionItem[],
  ): Promise<Balance[]> {
    const balances: Balance[] = []
    const BATCH_SIZE = 50

    // Split resources into batches of up to 50 items
    const resourceBatches = []
    for (let i = 0; i < resources.length; i += BATCH_SIZE) {
      resourceBatches.push(resources.slice(i, i + BATCH_SIZE))
    }

    for (const batch of resourceBatches) {
      const addresses = batch.map((item) => item.resource_address)
      const response: StateEntityDetailsVaultResponseItem[] =
        await this.gatewayClient.state.getEntityDetailsVaultAggregated(addresses)

      const divisibilities = new Map<string, number>()
      response.forEach((result) => {
        if (result.details !== undefined) {
          if (result.details.type === 'FungibleResource') {
            divisibilities.set(result.address, result.details.divisibility)
          }
        }
      })
      batch.forEach((item) => {
        if (item.aggregation_level === 'Global') {
          const asset: CompatibleAsset =
            item.resource_address === RADIX_ASSET_RESOURCE
              ? AssetXRD
              : {
                  chain: RadixChain,
                  symbol: item.resource_address,
                  ticker: item.resource_address,
                  type: AssetType.TOKEN,
                }
          const divisibility = divisibilities.get(item.resource_address) || 0
          // We need to do this because item.amount can be either string or number
          // depending on the type of resource
          const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount

          balances.push({
            asset,
            amount: assetToBase(assetAmount(amount, divisibility)),
          })
        }
      })
    }
    // Iterate through resources
    return balances
  }

  private async fetchNonFungibleResources(address: string): Promise<NonFungibleResourcesCollectionItem[]> {
    let hasNextPage = true
    let nextCursor = undefined
    const stateVersion = await this.currentStateVersion()
    let nonFungibleResources: NonFungibleResourcesCollectionItem[] = []

    while (hasNextPage) {
      const stateEntityNonFungiblesPageRequest: StateEntityNonFungiblesPageRequest = {
        address: address,
        limit_per_page: 5,
        cursor: nextCursor,
        at_ledger_state: {
          state_version: stateVersion,
        },
      }

      const stateEntityNonFungiblesPageResponse: StateEntityNonFungiblesPageResponse =
        await this.gatewayClient.state.innerClient.entityNonFungiblesPage({
          stateEntityNonFungiblesPageRequest: stateEntityNonFungiblesPageRequest,
        })
      nonFungibleResources = nonFungibleResources.concat(stateEntityNonFungiblesPageResponse.items)
      if (stateEntityNonFungiblesPageResponse.next_cursor) {
        nextCursor = stateEntityNonFungiblesPageResponse.next_cursor
      } else {
        hasNextPage = false
      }
    }
    return nonFungibleResources
  }

  private async fetchFungibleResources(address: string): Promise<FungibleResourcesCollectionItem[]> {
    let hasNextPage = true
    let nextCursor = undefined
    let fungibleResources: FungibleResourcesCollectionItem[] = []
    const stateVersion = await this.currentStateVersion()
    while (hasNextPage) {
      const stateEntityFungiblesPageRequest: StateEntityFungiblesPageRequest = {
        address: address,
        limit_per_page: 100,
        cursor: nextCursor,
        at_ledger_state: {
          state_version: stateVersion,
        },
      }

      const stateEntityFungiblesPageResponse: StateEntityFungiblesPageResponse =
        await this.gatewayClient.state.innerClient.entityFungiblesPage({
          stateEntityFungiblesPageRequest: stateEntityFungiblesPageRequest,
        })

      fungibleResources = fungibleResources.concat(stateEntityFungiblesPageResponse.items)
      if (stateEntityFungiblesPageResponse.next_cursor) {
        nextCursor = stateEntityFungiblesPageResponse.next_cursor
      } else {
        hasNextPage = false
      }
    }
    return fungibleResources
  }

  public async constructTransferIntent(
    from: string,
    to: string,
    resourceAddress: string,
    amount: number,
    notaryPublicKey: PublicKey,
    message?: string,
    methodsToCall?: MethodToCall,
  ): Promise<{ intent: Intent; fees: number }> {
    // This nonce will be used for preview and also when constructing the final transaction
    const nonce = generateRandomNonce()

    // Construct the intent with a random fee lock, say 5 XRD and then create a transaction intent
    // from it.
    const manifestWithHardcodedFee = methodsToCall
      ? RadixSpecificClient.createCustomTransferManifest(from, resourceAddress, amount, 5, methodsToCall)
      : RadixSpecificClient.createSimpleTransferManifest(from, to, resourceAddress, amount, 5)
    const intentWithHardcodedFee = await this.constructIntent(
      manifestWithHardcodedFee,
      message === null || message === undefined
        ? { kind: 'None' }
        : {
            kind: 'PlainText',
            value: { mimeType: 'text/plain', message: { kind: 'String', value: message as string } },
          },
      nonce,
      notaryPublicKey,
    )

    const previewReceipt = (await this.previewIntent(intentWithHardcodedFee)) as PartialTransactionPreviewResponse
    // Ensure that the preview was successful.
    if (previewReceipt.receipt.status !== 'Succeeded') {
      throw new Error(`Preview for fees was not successful.`)
    }

    // Calculate the total fees
    const totalFees = [
      previewReceipt.receipt.fee_summary.xrd_total_execution_cost,
      previewReceipt.receipt.fee_summary.xrd_total_finalization_cost,
      previewReceipt.receipt.fee_summary.xrd_total_royalty_cost,
      previewReceipt.receipt.fee_summary.xrd_total_storage_cost,
      previewReceipt.receipt.fee_summary.xrd_total_tipping_cost,
    ]
      .map(parseFloat)
      .reduce((acc, item) => acc + item, 0)

    // We need to add another 10% to the fees as the preview response does not include everything needed
    // to actually submit the transaction, ie: signature validation
    const totalFeesPlus10Percent = totalFees * 1.1

    // Construct a new intent with the calculated fees.
    const manifest = methodsToCall
      ? RadixSpecificClient.createCustomTransferManifest(
          from,
          resourceAddress,
          amount,
          totalFeesPlus10Percent,
          methodsToCall,
        )
      : RadixSpecificClient.createSimpleTransferManifest(from, to, resourceAddress, amount, totalFeesPlus10Percent)
    const intent = await this.constructIntent(
      manifest,
      message === null || message === undefined
        ? { kind: 'None' }
        : {
            kind: 'PlainText',
            value: { mimeType: 'text/plain', message: { kind: 'String', value: message as string } },
          },
      nonce,
      notaryPublicKey,
    )

    return {
      intent,
      fees: totalFees,
    }
  }

  public async submitTransaction(
    notarizedTransaction: NotarizedTransaction,
  ): Promise<[TransactionSubmitResponse, TransactionHash]> {
    const intentHash = await RadixEngineToolkit.NotarizedTransaction.intentHash(notarizedTransaction)
    const transactionHex = await RadixEngineToolkit.NotarizedTransaction.compile(notarizedTransaction).then(
      Convert.Uint8Array.toHexString,
    )
    const response = await this.innerGatewayClient.transaction.innerClient.transactionSubmit({
      transactionSubmitRequest: { notarized_transaction_hex: transactionHex },
    })

    return [response, intentHash]
  }
  // #endregion Public Methods

  // #region Private Methods
  private static createGatewayClient(network: number): GatewayApiClient {
    const applicationName = 'xchainjs'
    return GatewayApiClient.initialize({
      networkId: network,
      applicationName,
    })
  }

  private static createSimpleTransferManifest(
    from: string,
    to: string,
    resourceAddress: string,
    amount: number,
    amountToLockForFees: number,
  ): TransactionManifest {
    return new ManifestBuilder()
      .callMethod(from, 'lock_fee', [decimal(amountToLockForFees)])
      .callMethod(from, 'withdraw', [address(resourceAddress), decimal(amount)])
      .takeFromWorktop(resourceAddress, decimal(amount).value, (builder, bucketId) => {
        return builder.callMethod(to, 'try_deposit_or_abort', [bucket(bucketId), enumeration(0)])
      })
      .build()
  }

  private static createCustomTransferManifest(
    from: string,
    resourceAddress: string,
    amount: number,
    amountToLockForFees: number,
    methodsToCall: MethodToCall,
  ): TransactionManifest {
    const simpletTx = new ManifestBuilder()
      .callMethod(from, 'lock_fee', [decimal(amountToLockForFees)])
      .callMethod(from, 'withdraw', [address(resourceAddress), decimal(amount)])
      .takeFromWorktop(resourceAddress, decimal(amount).value, (builder) => {
        return builder.callMethod(methodsToCall.address, methodsToCall.methodName, methodsToCall.params)
      })

    return simpletTx.build()
  }

  private async constructIntent(
    manifest: TransactionManifest,
    message: Message,
    nonce: number,
    notaryPublicKey: PublicKey,
  ): Promise<Intent> {
    const epoch = await this.currentEpoch()
    return {
      header: {
        networkId: this.networkId,
        startEpochInclusive: epoch,
        endEpochExclusive: epoch + 10,
        nonce,
        notaryPublicKey,
        notaryIsSignatory: true,
        tipPercentage: 0,
      },
      manifest,
      message,
    }
  }

  private async previewIntent(intent: Intent): Promise<TransactionPreviewResponse> {
    // Translate the RET models to the gateway models for preview.
    const request: TransactionPreviewOperationRequest = {
      transactionPreviewRequest: {
        manifest: await RadixEngineToolkit.Instructions.convert(
          intent.manifest.instructions,
          this.networkId,
          'String',
        ).then((instructions) => instructions.value as string),
        blobs_hex: [],
        start_epoch_inclusive: intent.header.startEpochInclusive,
        end_epoch_exclusive: intent.header.endEpochExclusive,
        notary_public_key: RadixSpecificClient.retPublicKeyToGatewayPublicKey(intent.header.notaryPublicKey),
        notary_is_signatory: intent.header.notaryIsSignatory,
        tip_percentage: intent.header.tipPercentage,
        nonce: intent.header.nonce,
        signer_public_keys: [RadixSpecificClient.retPublicKeyToGatewayPublicKey(intent.header.notaryPublicKey)],
        // TODO: Add message
        flags: {
          assume_all_signature_proofs: false,
          skip_epoch_check: false,
          use_free_credit: false,
        },
      },
    }

    return this.innerGatewayClient.transaction.innerClient.transactionPreview(request)
  }

  private static retPublicKeyToGatewayPublicKey(publicKey: PublicKey): GatewayPublicKey {
    switch (publicKey.curve) {
      case 'Secp256k1':
        return {
          key_type: 'EcdsaSecp256k1',
          key_hex: publicKey.hex(),
        }
      case 'Ed25519':
        return {
          key_type: 'EddsaEd25519',
          key_hex: publicKey.hex(),
        }
    }
  }
  // #endregion Private Methods
}
