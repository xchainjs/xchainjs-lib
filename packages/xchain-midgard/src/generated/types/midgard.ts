
import { InlineResponse200  } from '../midgardApi';

export * from '../midgardApi';

export type PoolView = 'balances' | 'simple' | 'full';

export type TxQuery = {
  address?: string;
  txId?: string;
  asset?: string;
  type?: string;
  offset: number;
  limit: number;
};

export type TxData = InlineResponse200;


export type Interval = '5min' | 'hour' | 'day' | 'week' | 'month' | 'year';


