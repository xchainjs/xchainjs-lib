import { MidgardCache } from './midgard-cache'

/**
 * Class for getting data and process from Midgard API using MidgardCache for optimize request number (MAYAChain L2 Api).
 */
export class MidgardQuery {
  readonly midgardCache: MidgardCache

  /**
   * Constructor to create a MidgardQuery
   *
   * @param midgardCache - an instance of the midgardCache (could be pointing to stagenet,testnet,mainnet)
   * @returns MidgardQuery
   */
  constructor(midgardCache = new MidgardCache()) {
    this.midgardCache = midgardCache
  }
}
