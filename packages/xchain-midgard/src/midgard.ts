import {
  DefaultApi,
  Health,
  Network,
  InboundAddressesItem,
  DepthHistory,
  PoolDetail,
  EarningsHistory,
  LiquidityHistory,
  MemberDetails,
  PoolStatsDetail,
  Node,
  Constants,
  LastblockItem,
  ProxiedNode,
  Queue,
  StatsData,
  SwapHistory,
  THORNameDetails,
  TVLHistory,
  InlineResponse200
  } from './generated/midgardApi';
import { Configuration } from './generated/midgardApi'
import { MIDGARD_API_URL } from './config';


export interface MidgardApi {
  getBaseUrl: () => string;
}

export type TxData = InlineResponse200;

class Midgard implements MidgardApi {
  private baseUrl: string;
  private apiConfig: Configuration;
  private midgardAPI: DefaultApi;

  constructor() {
    this.baseUrl = MIDGARD_API_URL;
    this.apiConfig = new Configuration({ basePath: this.baseUrl });
    this.midgardAPI = new DefaultApi(this.apiConfig);
  }

  getBaseUrl = (): string => {
    return this.baseUrl;
  };

  async getActions(address?: string, txid?: string, asset?: string, type?: string, affiliateAddress?: string, limit?: number, offset?:number): Promise<TxData> {
    try {
      const { data } = await this.midgardAPI.getActions(address, txid, asset, type, affiliateAddress, limit, offset)
      return data;
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDepthHistory(pool: string, Interval?:'5min' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year', count?: number, to?: number, from?: number): Promise<DepthHistory> {
    try {
      const { data } = await this.midgardAPI.getDepthHistory(pool, Interval, count, to, from)
      return data;
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getEarningsHistory(interval?: "5min" | "hour" | "day" | "week" | "month" | "quarter" | "year", count?: number, to?: number, from?: number): Promise<EarningsHistory>{
    try {
      const { data } = await this.midgardAPI.getEarningsHistory(interval, count, to, from)
      return data;
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getHealth(): Promise<Health> {
    try {
      const { data } = await this.midgardAPI.getHealth();

      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getLiquidityHistory(pool?: string, interval?: "5min" | "hour" | "day" | "week" | "month" | "quarter" | "year", count?: number, to?: number, from?: number): Promise<LiquidityHistory> {
    try {
      const { data } = await this.midgardAPI.getLiquidityHistory(pool, interval, count, to, from)
      return data;
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getMemberDetail(address: string): Promise<MemberDetails> {
    try {
      const { data } = await this.midgardAPI.getMemberDetail(address)
      return data;
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getMembersAdresses(pool: string): Promise<string[]> {
    try {
      const { data } = await this.midgardAPI.getMembersAdresses(pool)
      return data;
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getNetworkData(): Promise<Network> {
    try {
      const { data } = await this.midgardAPI.getNetworkData();

      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getNodes(): Promise<Node[]> {
    try {
      const { data } = await this.midgardAPI.getNodes()
      return data;
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getPool(asset: string): Promise<PoolDetail> {
    try {
      const { data } = await this.midgardAPI.getPool(asset);

      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getPoolStats(asset: string, period?: '1h' | '24h' | '7d' | '30d' | '90d' | '365d' | 'all',): Promise<PoolStatsDetail> {
    try {
      const { data } = await this.midgardAPI.getPoolStats(asset, period);

      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getPools(status?: 'available' | 'staged' | 'suspended'): Promise<PoolDetail[]> {
    try {
      const { data } = await this.midgardAPI.getPools(status);

      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getProxiedConstants(): Promise<Constants>{
    try {
      const { data } = await this.midgardAPI.getProxiedConstants()
      return data;
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getProxiedInboundAddresses(): Promise<InboundAddressesItem[]> {
    try {
      const { data } = await this.midgardAPI.getProxiedInboundAddresses();

      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getProxiedLastBlock(): Promise<LastblockItem[]>{
    try {
      const { data } = await this.midgardAPI.getProxiedLastblock()
      return data;
    } catch (error) {
      return Promise.reject(error)
    }

  }

  async getProxiedNodes(): Promise<ProxiedNode[]>{
    try {
      const { data } = await this.midgardAPI.getProxiedNodes()
      return data;
    } catch (error) {
      return Promise.reject(error)
    }

  }
  async getProxiedQue(): Promise<Queue>{
    try {
      const { data } = await this.midgardAPI.getProxiedQueue()
      return data;
    } catch (error) {
      return Promise.reject(error)
    }

  }
  async getStats(): Promise<StatsData>{
    try {
      const { data } = await this.midgardAPI.getStats()
      return data;
    } catch (error) {
      return Promise.reject(error)
    }

  }
  async getSwapHistory(pool?: string, interval?: '5min' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year', count?: number, to?: number, from?: number): Promise<SwapHistory>{
    try {
      const { data } = await this.midgardAPI.getSwapHistory(pool, interval, count, to, from)
      return data;
    } catch (error) {
      return Promise.reject(error)
    }

  }
  async getTHORNameDetail(name: string): Promise<THORNameDetails>{
    try {
      const { data } = await this.midgardAPI.getTHORNameDetail(name)
      return data;
    } catch (error) {
      return Promise.reject(error)
    }

  }
  async getTHORNameByAddress(address: string): Promise<string[]>{
    try {
      const { data } = await this.midgardAPI.getTHORNamesByAddress(address)
      return data;
    } catch (error) {
      return Promise.reject(error)
    }

  }
  async getTVLHistory(interval?: '5min' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year', count?: number, to?: number, from?: number): Promise<TVLHistory>{
    try {
      const { data } = await this.midgardAPI.getTVLHistory(interval, count, to, from)
      return data;
    } catch (error) {
      return Promise.reject(error)
    }

  }
}

export { Midgard };
