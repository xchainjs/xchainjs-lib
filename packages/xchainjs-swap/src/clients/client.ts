import { Chain } from "@xchainjs/xchain-util";

// gets inbound addresss gasses, get pool depths
// getpoolID getinboundaddress
// getpoolEth getLPool


export interface IClient {
  chain: Chain
  balance: AssetAmount[]

  getInboundAddress(): Promise<string>
  getPoolID(poolId: PoolId): Promise<string>
  transfer(tx: TxParams): Promise<TxHash>

}
