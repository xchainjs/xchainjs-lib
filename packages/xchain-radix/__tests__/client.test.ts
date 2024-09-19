import {
  Configuration,
  GatewayStatusResponse,
  TransactionApi,
  TransactionStatus,
  TransactionStatusResponse,
} from '@radixdlt/babylon-gateway-api-sdk'
import { Convert, Instruction, RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit'
import { Balance, Fees, Network, XChainClientParams } from '@xchainjs/xchain-client'
import { AssetType, baseAmount } from '@xchainjs/xchain-util'

// eslint-disable-next-line ordered-imports/ordered-imports
import { generateMnemonic } from 'bip39'

import {
  mockCommittedDetailsResponse,
  mockEntityDeatilsResponse,
  mockStreamTransactionsResponse,
  mockTransactionPreviewResponse,
  stateEntityFungiblesPageResponse,
  stateEntityNonFungiblesPageResponse,
} from '../__mocks__/mocks'
import { AssetXRD, Client, RadixChain, Tx, TxParams, XRD_DECIMAL, feesEstimationPublicKeys } from '../src'

describe('RadixClient Test', () => {
  const createClient = (): Client => {
    const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
    const params: XChainClientParams = {
      network: Network.Testnet,
      phrase: phrase,
      feeBounds: { lower: 1, upper: 5 },
    }
    return new Client(params)
  }

  it('Create mainnet account', async () => {
    const mnemonic = generateMnemonic()
    const params: XChainClientParams = {
      network: Network.Mainnet,
      phrase: mnemonic,
    }
    const client = new Client(params)
    const address = await client.getAddressAsync()
    expect(address).toMatch(/^account_rdx/)
  })

  it('Create stokenet account', async () => {
    const mnemonic = generateMnemonic()
    const params: XChainClientParams = {
      network: Network.Testnet,
      phrase: mnemonic,
    }
    const client = new Client(params)
    const address = await client.getAddressAsync()
    expect(address).toMatch(/^account_tdx_2/)
  })

  it('Invalid phrase is thrown', async () => {
    const phrase = 'rural bright ball negative already grass good grant nation screen model'
    const params: XChainClientParams = {
      network: Network.Mainnet,
      phrase: phrase,
    }
    expect(() => new Client(params)).toThrowError('Invalid phrase')
  })

  it('client should be able to get address', async () => {
    const client = createClient()
    const address: string = await client.getAddressAsync()
    expect(address).toBe('account_tdx_2_129dw6f6zqtl3yxwusmw5tq93fnvcwpammdf0e0a8gn0pseepnfmar3')
  })

  it('client with Secp256k1 curve should be able to get address', async () => {
    const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
    const params: XChainClientParams = {
      network: Network.Mainnet,
      phrase: phrase,
    }
    const client = new Client({ ...params, curve: 'Secp256k1' })
    const address: string = await client.getAddressAsync()
    expect(address).toBe('account_rdx16xmah09yu9p9ynrmuc8z3a206n02tsmmkdvlmnx3cgu4s9r59wsxt2')
  })

  it('client should throw an Error when using getAddress', () => {
    const client = createClient()
    expect(() => client.getAddress()).toThrowError(
      'getAddress is synchronous and cannot retrieve addresses directly. Use getAddressAsync instead.',
    )
  })

  // TODO: santiago to get stokenet addresses derived by the wallet
  // it('client with derive the same keys as wallet', async () => {
  //   const phrase = 'equip will roof matter pink blind book anxiety banner elbow sun young'
  //   const params: XChainClientParams = {
  //     network: Network.Testnet,
  //     phrase: phrase,
  //   }
  //   const client = new Client(params, 'Ed25519')
  //   // Reference: https://github.com/radixdlt/sargon/blob/0ffac13ece645c500fe74d2f854186c6340b4cd7/fixtures/vector/cap26_curve25519.json#L6
  //   expect(client.getRadixPrivateKey().publicKeyHex()).toBe(
  //     '451152a1cef7be603205086d4ebac0a0b78fda2ff4684b9dea5ca9ef003d4e7d',
  //   )
  // })

  // it('client with derive the same keys as wallet using a secp256k1 curve', async () => {
  //   const phrase = 'equip will roof matter pink blind book anxiety banner elbow sun young'
  //   const params: XChainClientParams = {
  //     network: Network.Testnet,
  //     phrase: phrase,
  //   }
  //   const client = new Client(params, 'Secp256k1')
  //   // Reference: https://github.com/radixdlt/sargon/blob/0ffac13ece645c500fe74d2f854186c6340b4cd7/fixtures/vector/cap26_secp256k1.json#L6
  //   expect(client.getRadixPrivateKey().publicKeyHex()).toBe(
  //     '029932e6683332a3c0d8cd2862c129e0c2501f45c17c88eecac27cc22baf7f80ed',
  //   )
  // })

  it('client should be able to get the network', async () => {
    const client = createClient()
    const network = client.getNetwork()
    expect(network).toBe(Network.Testnet)
  })

  it('client should be able to get the explorer url', async () => {
    const client = createClient()
    const explorerAddress = client.getExplorerUrl()
    expect(explorerAddress).toBe('https://stokenet-dashboard.radixdlt.com')
  })

  it('client should be able to get the explorer url for stokenet', async () => {
    const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
    const params: XChainClientParams = {
      network: Network.Testnet,
      phrase: phrase,
    }
    const stokenetClient = new Client(params)
    const explorerAddress = stokenetClient.getExplorerUrl()
    expect(explorerAddress).toBe('https://stokenet-dashboard.radixdlt.com')
  })

  it('client should be able to get an address url', async () => {
    const client = createClient()
    const address: string = await client.getAddressAsync()
    const explorerAddress = client.getExplorerAddressUrl(address)
    expect(explorerAddress).toBe(
      'https://stokenet-dashboard.radixdlt.com/account/account_tdx_2_129dw6f6zqtl3yxwusmw5tq93fnvcwpammdf0e0a8gn0pseepnfmar3',
    )
  })

  it('client should be able to get a transaction url', async () => {
    const client = createClient()
    const explorerAddress = client.getExplorerTxUrl(
      'txid_rdx1ggem7tu4nuhwm3lcc8z9jwyyp03l92pn9xfgjkdf0277hkr8fs6sudeks2',
    )
    expect(explorerAddress).toBe(
      'https://stokenet-dashboard.radixdlt.com/transaction/txid_rdx1ggem7tu4nuhwm3lcc8z9jwyyp03l92pn9xfgjkdf0277hkr8fs6sudeks2',
    )
  })

  it('client should be able validate a valid address async', async () => {
    const client = createClient()
    const address: string = await client.getAddressAsync()
    const isValid = await client.validateAddressAsync(address)
    expect(isValid).toBe(true)
  })

  it('client should be able validate a mainnet valid address async', async () => {
    const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
    const params: XChainClientParams = {
      network: Network.Mainnet,
      phrase: phrase,
      feeBounds: { lower: 1, upper: 5 },
    }
    const client = new Client(params)
    const address: string = await client.getAddressAsync()
    const isValid = await client.validateAddressAsync(address)
    expect(isValid).toBe(true)
  })

  it('client should fail to validate an invalid address async', async () => {
    const client = createClient()
    const isValid = await client.validateAddressAsync('invalid_address')
    expect(isValid).toBe(false)
  })

  it('client should be able validate a valid address', async () => {
    const client = createClient()
    const address: string = await client.getAddressAsync()
    const isValid = client.validateAddress(address)
    expect(isValid).toBe(true)
  })

  test('Invalid address with incorrect prefix', () => {
    const invalidAddress = 'wrongprefix_xyz123'
    const client = createClient()
    expect(client.validateAddress(invalidAddress)).toBe(false)
  })

  test('Invalid address with incorrect network', () => {
    const client = createClient()
    const invalidAddress = 'account_wrongnetwork123'
    expect(client.validateAddress(invalidAddress)).toBe(false)
  })

  test('Invalid address with incorrect length', () => {
    const invalidAddress = 'account_xyz123invalidlength'
    const client = createClient()
    expect(client.validateAddress(invalidAddress)).toBe(false)
  })

  test('Invalid address with invalid characters', () => {
    const invalidAddress = 'account_xyz$%^123'
    const client = createClient()
    expect(client.validateAddress(invalidAddress)).toBe(false)
  })

  test('Invalid address with empty string', () => {
    const emptyAddress = ''
    const client = createClient()
    expect(client.validateAddress(emptyAddress)).toBe(false)
  })

  it('client should be able to get transaction data for a given tx id', async () => {
    const client = createClient()
    const transactionCommittedDetailsMock = jest.fn().mockResolvedValue(mockCommittedDetailsResponse)
    client.radixClient.gatewayClient.transaction.innerClient.transactionCommittedDetails =
      transactionCommittedDetailsMock

    const transaction: Tx = await client.getTransactionData(
      'txid_rdx195z9zjp43qvqk8fnzmnpazv5m7jsaepq6cnm5nnnn5p3m2573rvqamjaa8',
    )
    expect(transaction.from[0].from).toBe('account_rdx169yt0y36etavnnxp4du5ekn7qq8thuls750q6frq5xw8gfq52dhxhg')
    expect(transaction.to[0].to).toBe('account_rdx16x47guzq44lmplg0ykfn2eltwt5wweylpuupstsxnfm8lgva7tdg2w')
  })

  it('client should be able to get balances for an account', async () => {
    const client = createClient()
    const stateEntityFungiblesPageResponseMock = jest.fn().mockResolvedValue(stateEntityFungiblesPageResponse)
    client.radixClient.gatewayClient.state.innerClient.entityFungiblesPage = stateEntityFungiblesPageResponseMock

    const stateEntityNonFungiblesPageResponseMock = jest.fn().mockResolvedValue(stateEntityNonFungiblesPageResponse)
    client.radixClient.gatewayClient.state.innerClient.entityNonFungiblesPage = stateEntityNonFungiblesPageResponseMock

    const stateEntityDetailsResponseMock = jest.fn().mockResolvedValue(mockEntityDeatilsResponse)
    client.radixClient.gatewayClient.state.getEntityDetailsVaultAggregated = stateEntityDetailsResponseMock

    const balances: Balance[] = await client.getBalance(
      'account_rdx16x47guzq44lmplg0ykfn2eltwt5wweylpuupstsxnfm8lgva7tdg2w',
    )
    balances.forEach((balance) => {
      expect(balance.amount.gte(0)).toBe(true)
    })
  })

  it('client should be able to get filtered balances for an account', async () => {
    const client = createClient()

    const stateEntityFungiblesPageResponseMock = jest.fn().mockResolvedValue(stateEntityFungiblesPageResponse)
    client.radixClient.gatewayClient.state.innerClient.entityFungiblesPage = stateEntityFungiblesPageResponseMock

    const stateEntityNonFungiblesPageResponseMock = jest.fn().mockResolvedValue(stateEntityNonFungiblesPageResponse)
    client.radixClient.gatewayClient.state.innerClient.entityNonFungiblesPage = stateEntityNonFungiblesPageResponseMock

    const stateEntityDetailsResponseMock = jest.fn().mockResolvedValue(mockEntityDeatilsResponse)
    client.radixClient.gatewayClient.state.getEntityDetailsVaultAggregated = stateEntityDetailsResponseMock

    const balances: Balance[] = await client.getBalance(
      'account_rdx16x47guzq44lmplg0ykfn2eltwt5wweylpuupstsxnfm8lgva7tdg2w',
      [
        {
          chain: RadixChain,
          symbol: 'resource_rdx1th2hexq3yrz8sj0nn3033gajnj7ztl0erp4nn9mcl5rj9au75tum0u',
          ticker: 'resource_rdx1th2hexq3yrz8sj0nn3033gajnj7ztl0erp4nn9mcl5rj9au75tum0u',
          type: AssetType.TOKEN,
        },
      ],
    )
    expect(balances.length).toBe(2)
    expect(balances[0].asset.symbol).toBe('XRD')
    expect(balances[1].asset.symbol).toBe('resource_rdx1th2hexq3yrz8sj0nn3033gajnj7ztl0erp4nn9mcl5rj9au75tum0u')
  })

  it('client should be able to estimate the fee for a given transaction', async () => {
    const client = createClient()

    const getCurrentMock = jest.fn().mockResolvedValue({ ledger_state: { epoch: 123 } } as GatewayStatusResponse)
    client.radixClient.gatewayClient.status.getCurrent = getCurrentMock
    const transactionPreviewResponseMock = jest.fn().mockResolvedValue(mockTransactionPreviewResponse)
    client.radixClient.gatewayClient.transaction.innerClient.transactionPreview = transactionPreviewResponseMock

    const fees: Fees = await client.getFees()
    expect(fees.average.gt(0)).toBe(true)
    expect(fees.fast.gt(0)).toBe(true)
    expect(fees.fastest.gt(0)).toBe(true)
  })

  it('client should be able to get transactions for a given account', async () => {
    const client = createClient()

    const streamTransactionsResponseMock = jest.fn().mockResolvedValue(mockStreamTransactionsResponse)
    client.radixClient.gatewayClient.stream.innerClient.streamTransactions = streamTransactionsResponseMock

    const transactionsHistoryParams = {
      address: 'account_rdx169yt0y36etavnnxp4du5ekn7qq8thuls750q6frq5xw8gfq52dhxhg',
      offset: 72533720,
      limit: 200,
      asset: 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
    }
    const txs = await (await client.getTransactions(transactionsHistoryParams)).txs
    txs.forEach((tx) => {
      expect(tx.from).not.toBeUndefined()
      expect(tx.to).not.toBeUndefined()
    })
  })

  it('client should be able prepare a transaction', async () => {
    const client = createClient()

    const getCurrentMock = jest.fn().mockResolvedValue({ ledger_state: { epoch: 123 } } as GatewayStatusResponse)
    client.radixClient.gatewayClient.status.getCurrent = getCurrentMock
    const transactionPreviewResponseMock = jest.fn().mockResolvedValue(mockTransactionPreviewResponse)
    client.radixClient.gatewayClient.transaction.innerClient.transactionPreview = transactionPreviewResponseMock

    const txParams: TxParams = {
      asset: AssetXRD,
      amount: baseAmount(1),
      recipient: 'account_tdx_2_129wjagjzxltd0clr3q4z7hqpw5cc7weh9trs4e9k3zfwqpj636e5zf',
      memo: 'test',
    }
    const preparedTx = await client.prepareTx(txParams)
    const decompiledIntent = await RadixEngineToolkit.Intent.decompile(
      Convert.HexString.toUint8Array(preparedTx.rawUnsignedTx),
    )
    // TODO add better assertions
    expect(decompiledIntent.manifest.instructions.value.length).toBe(4)
    const instructions = decompiledIntent.manifest.instructions.value as Instruction[]
    expect(instructions[0].kind).toBe('CallMethod')
    if (instructions[0].kind === 'CallMethod') {
      const callMethodInstruction = instructions[0] as { kind: 'CallMethod'; methodName: string }
      expect(callMethodInstruction.methodName).toBe('lock_fee')
    }

    expect(instructions[1].kind).toBe('CallMethod')
    if (instructions[1].kind === 'CallMethod') {
      const takeFromWorktopInstruction = instructions[1] as { kind: 'CallMethod'; methodName: string }
      expect(takeFromWorktopInstruction.methodName).toBe('withdraw')
    }
  })

  it('client should be able transfer', async () => {
    const client = createClient()

    const broadcastTxMock = jest.fn()
    client.broadcastTx = broadcastTxMock

    const getCurrentMock = jest.fn().mockResolvedValue({ ledger_state: { epoch: 123 } } as GatewayStatusResponse)
    client.radixClient.gatewayClient.status.getCurrent = getCurrentMock

    const transactionPreviewResponseMock = jest.fn().mockResolvedValue(mockTransactionPreviewResponse)
    client.radixClient.gatewayClient.transaction.innerClient.transactionPreview = transactionPreviewResponseMock

    const txParams: TxParams = {
      asset: AssetXRD,
      amount: baseAmount(1),
      recipient: 'account_tdx_2_129wjagjzxltd0clr3q4z7hqpw5cc7weh9trs4e9k3zfwqpj636e5zf',
      memo: 'test',
    }
    await client.transfer(txParams)
    expect(broadcastTxMock).toBeCalledTimes(1)
  })

  it('client should be able broadcast tx', async () => {
    const client = createClient()
    const transactionSubmitMock = jest.fn()
    client.radixClient.gatewayClient.transaction.innerClient.transactionSubmit = transactionSubmitMock
    const transactionHex =
      '4d22030221022104210707020a7b000000000000000a850000000000000009a92f3af1220101200720f926e5d67daa984375a86abbb305abc350c7dadba11d348c1cf4db27640c8d4e0101080000202203410380005155d545fc40d2d01750b5d055631ddc6fa6b1f6779fec707b167ef695580c156c6f636b5f6665655f616e645f7769746864726177210385c48edb420206cc050000000000000000000000000000000080005da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c685000064a7b3b6e00d00000000000000000000000000000000000280005da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c685000064a7b3b6e00d0000000000000000000000000000000041038000515d2ea24237d6d7e3e3882a2f5c0175318f3b372ac70ae4b68892e0065a0c147472795f6465706f7369745f6f725f61626f72742102810000000022000020200022010121020c0a746578742f706c61696e2200010c04746573742022002201012101200740b2f028fb4e2e130a9480d253a7709839980a7ed5e91394825115795d3f5b688e9472521295f90ae840e64bb82b9d086d9127bf2e53be55f0ee13775148defb09'
    await client.broadcastTx(transactionHex)
    expect(client.radixClient.gatewayClient.transaction.innerClient.transactionSubmit).toBeCalledTimes(1)
  })

  it('client should be able prepare a tx without mocking', async () => {
    const client = createClient()

    const txParams: TxParams = {
      asset: AssetXRD,
      amount: baseAmount(1000000000000000000, XRD_DECIMAL),
      recipient: 'account_tdx_2_129wjagjzxltd0clr3q4z7hqpw5cc7weh9trs4e9k3zfwqpj636e5zf',
      memo: 'test',
    }
    const preparedTx = await client.prepareTx(txParams)
    const decompiledIntent = await RadixEngineToolkit.Intent.decompile(
      Convert.HexString.toUint8Array(preparedTx.rawUnsignedTx),
    )

    expect(decompiledIntent.manifest.instructions.value.length).toBe(4)
    const instructions = decompiledIntent.manifest.instructions.value as Instruction[]
    expect(instructions[0].kind).toBe('CallMethod')
    if (instructions[0].kind === 'CallMethod') {
      const callMethodInstruction = instructions[0] as { kind: 'CallMethod'; methodName: string }
      expect(callMethodInstruction.methodName).toBe('lock_fee')
    }

    expect(instructions[1].kind).toBe('CallMethod')
    if (instructions[1].kind === 'CallMethod') {
      const takeFromWorktopInstruction = instructions[1] as { kind: 'CallMethod'; methodName: string }
      expect(takeFromWorktopInstruction.methodName).toBe('withdraw')
    }

    expect(instructions[3].kind).toBe('CallMethod')
    if (instructions[3].kind === 'CallMethod') {
      const callMethodInstruction = instructions[3] as {
        kind: 'CallMethod'
        methodName: string
        address: { kind: 'Static'; value: string }
      }
      expect(callMethodInstruction.methodName).toBe('try_deposit_or_abort')
      expect(callMethodInstruction.address.value).toBe(
        'account_tdx_2_129wjagjzxltd0clr3q4z7hqpw5cc7weh9trs4e9k3zfwqpj636e5zf',
      )
    }
  })

  const getTransactionStatus = async (
    transactionApi: TransactionApi,
    transactionId: string,
  ): Promise<TransactionStatusResponse> =>
    transactionApi.transactionStatus({
      transactionStatusRequest: {
        intent_hash: transactionId,
      },
    })

  it('client should be able transfer without mock', async () => {
    const client = createClient()
    const txParams: TxParams = {
      asset: AssetXRD,
      amount: baseAmount(10000000000000000, XRD_DECIMAL),
      recipient: feesEstimationPublicKeys[2].to,
      memo: 'test',
    }
    const transactionId = await client.transfer(txParams)

    await new Promise((resolve) => setTimeout(resolve, 5000))
    const NetworkConfiguration = {
      gatewayBaseUrl: 'https://stokenet.radixdlt.com',
      networkId: 0x02,
    }
    const apiConfiguration = new Configuration({
      basePath: NetworkConfiguration.gatewayBaseUrl,
    })
    const transactionApi = new TransactionApi(apiConfiguration)
    const transactionStatus = await getTransactionStatus(transactionApi, transactionId)
    expect(transactionStatus.status).toBe(TransactionStatus.CommittedSuccess)
  })
})
