/* eslint-disable @typescript-eslint/no-explicit-any */
export class CachedValue<T> {
  private cachedValue: T | undefined
  private cacheTimestamp: Date | undefined
  private cacheMaxAge: number
  private refreshData: (params?: any) => Promise<T>
  private refreshPromise: Promise<T> | null = null

  constructor(refreshData: (params?: any) => Promise<T>, cacheMaxAge?: number) {
    this.cacheMaxAge = cacheMaxAge || Infinity
    this.refreshData = refreshData
  }

  private isCacheValid() {
    return Boolean(this.cacheTimestamp && new Date().getTime() - this.cacheTimestamp.getTime() < this.cacheMaxAge)
  }

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
