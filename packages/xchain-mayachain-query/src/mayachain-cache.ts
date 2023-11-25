import { MidgardQuery } from '@xchainjs/xchain-mayamidgard-query'

import { Mayanode } from './utils'

/**
 * This class manages retrieving information from up to date Mayachain
 */
export class MayachainCache {
  readonly midgardQuery: MidgardQuery
  readonly mayanode: Mayanode
  /**
   * Constructor to create a MayachainCache
   *
   * @param midgardQuery - an instance of the Maya MidgardQuery API
   * @param mayanode
   * @returns MayachainCache
   */
  constructor(midgardQuery = new MidgardQuery(), mayanode = new Mayanode()) {
    this.midgardQuery = midgardQuery
    this.mayanode = mayanode
  }
}
