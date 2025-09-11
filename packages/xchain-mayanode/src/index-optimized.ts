/**
 * Optimized Mayanode API - Dynamic Loading Approach
 * Only loads API classes when they're actually needed
 */

export * from './config'

// Re-export commonly used types
export type {
  Pool,
  LastBlock,
  TradeAccountResponse,
  TradeUnitResponse,
  LiquidityProviderSummary,
  Saver,
  TxDetailsResponse,
  TxSignersResponse,
  QuoteFees,
  QuoteSwapResponse,
} from './selective-api-complete'

export { Configuration } from './selective-api-complete'

// Dynamic API imports to reduce initial bundle size
export const loadTransactionsApi = () => import('./selective-api-complete').then((m) => m.TransactionsApi)
export const loadQueueApi = () => import('./selective-api-complete').then((m) => m.QueueApi)
export const loadNetworkApi = () => import('./selective-api-complete').then((m) => m.NetworkApi)
export const loadPoolsApi = () => import('./selective-api-complete').then((m) => m.PoolsApi)
export const loadLiquidityProvidersApi = () => import('./selective-api-complete').then((m) => m.LiquidityProvidersApi)
export const loadSaversApi = () => import('./selective-api-complete').then((m) => m.SaversApi)
export const loadQuoteApi = () => import('./selective-api-complete').then((m) => m.QuoteApi)
export const loadMimirApi = () => import('./selective-api-complete').then((m) => m.MimirApi)
export const loadThornamesApi = () => import('./selective-api-complete').then((m) => m.ThornamesApi)
export const loadTradeUnitApi = () => import('./selective-api-complete').then((m) => m.TradeUnitApi)
export const loadTradeUnitsApi = () => import('./selective-api-complete').then((m) => m.TradeUnitsApi)
export const loadTradeAccountApi = () => import('./selective-api-complete').then((m) => m.TradeAccountApi)
export const loadTradeAccountsApi = () => import('./selective-api-complete').then((m) => m.TradeAccountsApi)
export const loadRUNEPoolApi = () => import('./selective-api-complete').then((m) => m.RUNEPoolApi)

// Convenience factory functions for commonly used patterns
export async function createMayanodeApiClient(baseUrl: string) {
  const { Configuration } = await import('./selective-api-complete')
  const config = new Configuration({ basePath: baseUrl })

  return {
    async getTransactionsApi() {
      const TransactionsApi = await loadTransactionsApi()
      return new TransactionsApi(config)
    },
    async getQueueApi() {
      const QueueApi = await loadQueueApi()
      return new QueueApi(config)
    },
    async getNetworkApi() {
      const NetworkApi = await loadNetworkApi()
      return new NetworkApi(config)
    },
    async getPoolsApi() {
      const PoolsApi = await loadPoolsApi()
      return new PoolsApi(config)
    },
    async getLiquidityProvidersApi() {
      const LiquidityProvidersApi = await loadLiquidityProvidersApi()
      return new LiquidityProvidersApi(config)
    },
    async getSaversApi() {
      const SaversApi = await loadSaversApi()
      return new SaversApi(config)
    },
    async getQuoteApi() {
      const QuoteApi = await loadQuoteApi()
      return new QuoteApi(config)
    },
    async getMimirApi() {
      const MimirApi = await loadMimirApi()
      return new MimirApi(config)
    },
    async getThornamesApi() {
      const ThornamesApi = await loadThornamesApi()
      return new ThornamesApi(config)
    },
    async getTradeUnitApi() {
      const TradeUnitApi = await loadTradeUnitApi()
      return new TradeUnitApi(config)
    },
    async getTradeUnitsApi() {
      const TradeUnitsApi = await loadTradeUnitsApi()
      return new TradeUnitsApi(config)
    },
    async getTradeAccountApi() {
      const TradeAccountApi = await loadTradeAccountApi()
      return new TradeAccountApi(config)
    },
    async getTradeAccountsApi() {
      const TradeAccountsApi = await loadTradeAccountsApi()
      return new TradeAccountsApi(config)
    },
    async getRUNEPoolApi() {
      const RUNEPoolApi = await loadRUNEPoolApi()
      return new RUNEPoolApi(config)
    },
  }
}

// Legacy compatibility - direct exports for backward compatibility
// These will be tree-shaken out if not used
export {
  TransactionsApi,
  QueueApi,
  NetworkApi,
  PoolsApi,
  LiquidityProvidersApi,
  SaversApi,
  QuoteApi,
  MimirApi,
  ThornamesApi,
  TradeUnitApi,
  TradeUnitsApi,
  TradeAccountApi,
  TradeAccountsApi,
  RUNEPoolApi,
} from './selective-api-complete'
