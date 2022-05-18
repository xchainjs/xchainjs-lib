import { Interval, TxData} from './generated/types/midgard';

import {
  DefaultApi,
  Health,
  Network,
  InboundAddressesItem,
  DepthHistory,
  PoolDetail,
  StatsData} from './generated/midgardApi';
import { Configuration } from './generated/midgardApi'
import { MIDGARD_API_URL } from './config';



export interface MidgardApi {
  getBaseUrl: () => string;
}

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

  async getActions(): Promise<TxData> {
    try {
      const { data } = await this.midgardAPI.getActions()
      return data;
    } catch (error) {
      return Promise.reject(error)
    }
  }
  async getDepthHistory(pool: string, Interval?: any ): Promise<DepthHistory> {
    try {
      const { data } = await this.midgardAPI.getDepthHistory(pool, Interval)
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

  async getStats(): Promise<StatsData> {
    try {
      const { data } = await this.midgardAPI.getStats();

      return data;
    } catch (error) {
      return Promise.reject(error);
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


  async getPool(asset: string): Promise<PoolDetail> {
    try {
      const { data } = await this.midgardAPI.getPool(asset);

      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async getPools(status:'available'): Promise<PoolDetail[]> {
    try {
      const { data } = await this.midgardAPI.getPools(status);

      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getPoolAddresses(): Promise<InboundAddressesItem[]> {
    try {
      const { data } = await this.midgardAPI.getProxiedInboundAddresses();

      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export { Midgard };
