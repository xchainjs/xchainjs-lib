import {
  Delegate,
  DelegateFactory,
  DelegateFactoryClientParamsType,
  DelegateFactoryDelegateType,
  TxHistoryParams,
  TxParams,
} from './delegate'
import { Address, AssumeFunction, Balance, Explorer, Fees, Network, Tx, TxHash, TxsPage } from './types'

type PairsOf<T, U> = U extends keyof T ? [U, T[U]] : never
type Pairs<T> = PairsOf<T, keyof T>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FunctionPairsOnly<T> = T extends [unknown, infer R] ? (R extends (...args: any[]) => any ? T : never) : never
type KeysOfPairs<T> = T extends [infer R, unknown] ? R : never
type FunctionKeysOf<T> = KeysOfPairs<FunctionPairsOnly<Pairs<T>>>

type AssumeDelegateFunction<T> = T extends Delegate<infer R>
  ? T extends (clientParams: R, ...args: unknown[]) => Promise<unknown>
    ? T
    : never
  : never

export class Client<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DelegateFactoryType extends DelegateFactory<any, any>
> {
  private _network: Network
  get network() {
    return this._network
  }
  set network(value: Network) {
    if (!(value in this.params)) throw new Error(`this client does not support network '${value}'`)
    this._network = value
  }

  /**
   * @deprecated
   */
  getNetwork(): Network {
    return this.network
  }

  /**
   * @deprecated
   */
  setNetwork(value: Network) {
    this.network = value
  }

  readonly params: Record<Network, DelegateFactoryClientParamsType<DelegateFactoryType>>
  protected get currentParams() {
    return this.params[this.network]
  }

  protected _delegate: Promise<DelegateFactoryDelegateType<DelegateFactoryType>> | null = null
  get delegate() {
    return this._delegate ?? Promise.reject(new Error('delegate not set; client needs unlocking'))
  }

  private readonly delegateFactory: DelegateFactoryType

  constructor(
    delegateFactory: DelegateFactoryType,
    params: Record<Network, DelegateFactoryClientParamsType<DelegateFactoryType>>,
    network: Network,
  ) {
    this.delegateFactory = delegateFactory
    this.params = Object.freeze({
      ...params,
    })
    // The first one initializes the variable; the second forces an error if the `network` isn't recognized.
    this._network = network
    this.network = network
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static bindDelegateFactory<ClientType extends Client<any>>(
    delegateFactory: ClientDelegateFactoryType<ClientType>,
    defaultClientParams?: Record<Network, ClientClientParamsType<ClientType>>,
  ): BoundClientFactory<ClientType> {
    return async (
      clientParams: Partial<Record<Network, Partial<ClientClientParamsType<ClientType>>>>,
      network: Network = 'testnet',
      ...unlockParams: Parameters<ClientDelegateFactoryType<ClientType>>
    ): Promise<ClientType> => {
      const mergedClientParams = (Object.keys({
        ...defaultClientParams,
        ...clientParams,
      }) as Network[]).reduce(
        (a, x) => (
          (a[x] = Object.assign({
            ...defaultClientParams?.[x],
            ...clientParams?.[x],
          })),
          a
        ),
        {} as Record<Network, ClientClientParamsType<ClientType>>,
      )
      const out = new this(delegateFactory, mergedClientParams, network)
      if (out.unlock.length == 0 || unlockParams.length > 0) await out.unlock(...unlockParams)
      return out as ClientType
    }
  }

  async unlock(...args: Parameters<DelegateFactoryType>): Promise<void> {
    await this.purgeClient()
    const delegate = this.delegateFactory(...args)
    this._delegate = delegate
    await delegate
  }

  async purgeClient(): Promise<void> {
    const delegate = this._delegate
    this._delegate = null
    await (await delegate)?.purge?.()
  }

  protected useExplorerMethod<MethodNameType extends FunctionKeysOf<Explorer>>(
    name: MethodNameType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any {
    const explorer = this.currentParams.explorer
    const method = explorer[name] as AssumeFunction<typeof explorer[MethodNameType]>
    const methodWithArgsTypeErased = method as (...args: unknown[]) => ReturnType<typeof method>
    const out = methodWithArgsTypeErased.apply(explorer, args) as ReturnType<typeof method>
    return out
  }

  get explorerUrl() {
    return this.currentParams.explorer.url
  }
  /**
   * @deprecated
   */
  getExplorerUrl() {
    return this.explorerUrl
  }
  getExplorerAddressUrl(address: Address): string {
    // eslint-disable-next-line prefer-rest-params
    return this.useExplorerMethod('getAddressUrl', ...[address, ...Array.from(arguments).slice(1)])
  }
  getExplorerTxUrl(txid: string): string {
    // eslint-disable-next-line prefer-rest-params
    return this.useExplorerMethod('getTxUrl', ...[txid, ...Array.from(arguments).slice(1)])
  }

  protected useCurrentParamsMethod<MethodNameType extends keyof DelegateFactoryClientParamsType<DelegateFactoryType>>(
    name: MethodNameType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any {
    const params = this.currentParams
    const method = params[name] as AssumeFunction<typeof params[MethodNameType]>
    const methodWithArgsTypeErased = method as (...args: unknown[]) => ReturnType<typeof method>
    return methodWithArgsTypeErased.apply(params, args)
  }

  getFullDerivationPath(
    ...args: Parameters<DelegateFactoryClientParamsType<DelegateFactoryType>['getFullDerivationPath']>
  ): ReturnType<DelegateFactoryClientParamsType<DelegateFactoryType>['getFullDerivationPath']> {
    // eslint-disable-next-line prefer-rest-params
    return this.useCurrentParamsMethod('getFullDerivationPath', ...args)
  }

  protected async useDelegateMethod<MethodNameType extends keyof DelegateFactoryDelegateType<DelegateFactoryType>>(
    name: MethodNameType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): Promise<any> {
    const params = this.currentParams
    const delegate = await this.delegate
    const method = delegate[name]
    const asyncMethod = method as AssumeDelegateFunction<typeof method>
    return asyncMethod.call(delegate, params, ...args)
  }

  validateAddress(address: string): Promise<boolean> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('validateAddress', ...[address, Array.from(arguments).slice(1)])
  }
  getAddress(walletIndex?: number): Promise<Address> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getAddress', ...[walletIndex, Array.from(arguments).slice(1)])
  }
  getBalance(address: Address): Promise<Balance[]> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getBalance', ...[address, Array.from(arguments).slice(1)])
  }
  getTransactions(params: TxHistoryParams): Promise<TxsPage> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getTransactions', ...[params, Array.from(arguments).slice(1)])
  }
  getTransactionData(txId: string): Promise<Tx> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getTransactionData', ...[txId, Array.from(arguments).slice(1)])
  }
  getFees(): Promise<Fees> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getFees', ...[Array.from(arguments).slice(0)])
  }
  transfer(params: TxParams): Promise<TxHash> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('transfer', ...[params, Array.from(arguments).slice(1)])
  }
}

export type ClientDelegateFactoryType<T> = T extends Client<infer R> ? R : never
export type ClientDelegateType<T> = DelegateFactoryDelegateType<ClientDelegateFactoryType<T>>
export type ClientClientParamsType<T> = DelegateFactoryClientParamsType<ClientDelegateFactoryType<T>>
export type ClientUnlockParamsType<T> = Parameters<ClientDelegateFactoryType<T>>

export type ClientFactory<ClientType> = {
  new (
    delegateFactory: ClientDelegateFactoryType<ClientType>,
    params: Record<Network, ClientClientParamsType<ClientType>>,
    network: Network,
  ): ClientType
}

export type BoundClientFactory<ClientType> = (
  params: Partial<Record<Network, Partial<ClientClientParamsType<ClientType>>>>,
  network: Network,
  ...unlockParams: ClientUnlockParamsType<ClientType>
) => Promise<ClientType>

export function bindClientFactory<
  ClientType extends Client<DelegateFactoryType>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DelegateFactoryType extends DelegateFactory<any, any>
>(
  clientFactory: ClientFactory<ClientType>,
  delegateFactory: ClientDelegateFactoryType<ClientType>,
  defaultClientParams?: Record<Network, ClientClientParamsType<ClientType>>,
): BoundClientFactory<ClientType> {
  return async (
    clientParams: Partial<Record<Network, Partial<ClientClientParamsType<ClientType>>>>,
    network: Network = 'testnet',
    ...unlockParams: Parameters<DelegateFactoryType>
  ): Promise<ClientType> => {
    const mergedClientParams = (Object.keys({
      ...defaultClientParams,
      ...clientParams,
    }) as Network[]).reduce(
      (a, x) => (
        (a[x] = Object.assign({
          ...defaultClientParams?.[x],
          ...clientParams?.[x],
        })),
        a
      ),
      {} as Record<Network, ClientClientParamsType<ClientType>>,
    )
    const out = new clientFactory(delegateFactory, mergedClientParams, network)
    if (out.unlock.length == 0 || unlockParams.length > 0) await out.unlock(...unlockParams)
    return out
  }
}
