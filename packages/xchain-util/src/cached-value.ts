/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Utility class for caching stable data
 */
export class CachedValue<T> {
  private cachedValue: T | undefined
  private cacheTimestamp: Date | undefined
  private cacheMaxAge: number
  private refreshData: (params?: any) => Promise<T>
  private refreshPromise: Promise<T> | null = null

  /**
   * @constructor
   * @param refreshData function that refresh and return the data
   * @param {number|undefined} cacheMaxAge time in millisecond to expire cache
   */
  constructor(refreshData: (params?: any) => Promise<T>, cacheMaxAge?: number) {
    this.cacheMaxAge = cacheMaxAge || Infinity
    this.refreshData = refreshData
  }

  /**
   * @private
   * Validates if internal cache is valid or expired
   */
  private isCacheValid() {
    return Boolean(this.cacheTimestamp && new Date().getTime() - this.cacheTimestamp.getTime() < this.cacheMaxAge)
  }

  /**
   * Returns cached data if valid or request fresh data if cache is invalid
   * @param params use this params to request data if cache is expired
   */
  async getValue(params?: any): Promise<T> {
    if (this.isCacheValid()) {
      return this.cachedValue as T
    }

    if (this.refreshPromise) {
      this.cachedValue = await this.refreshPromise
    } else {
      this.refreshPromise = this.refreshData(params)
      this.cachedValue = await this.refreshPromise
      this.cacheTimestamp = new Date()
      this.refreshPromise = null
    }

    return this.cachedValue as T
  }
}
