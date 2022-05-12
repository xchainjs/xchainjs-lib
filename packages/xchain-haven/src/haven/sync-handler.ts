import { getAddressInfo } from './api'
import { SyncObserver, SyncStats } from './types'
import { assertIsDefined } from './utils'

const SYNC_THRESHOLD = 1000

class SyncHandler {
  private scannedHeight: number | undefined = undefined
  private blockHeight: number | undefined = undefined
  private updateSyncProgressIntervalID: ReturnType<typeof setInterval> | undefined
  private syncObservers: SyncObserver[] = []

  async subscribeSyncProgress(newObserver: SyncObserver) {
    // do check if we need to track a sync progress at all
    if ((await this.isSyncing()) && this.updateSyncProgressIntervalID === undefined) {
      this.updateSyncProgressIntervalID = setInterval(() => this.updateSyncProgress(), 10 * 1000)
    }

    this.syncObservers.push(newObserver)
    const syncState = await this.getSyncState()
    this.updateSyncObservers([newObserver], syncState)
  }

  async updateSyncProgress() {
    await this.fetchSyncProgress()

    assertIsDefined(this.scannedHeight)
    assertIsDefined(this.blockHeight)

    const syncState: SyncStats = await this.getSyncState()
    this.updateSyncObservers(this.syncObservers, syncState)

    if (!(await this.isSyncing())) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      clearInterval(this.updateSyncProgressIntervalID) // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      this.updateSyncProgressIntervalID = undefined
    }
  }

  async isSyncing() {
    if (this.scannedHeight === undefined || this.blockHeight === undefined) {
      await this.fetchSyncProgress()
    }

    assertIsDefined(this.blockHeight)
    assertIsDefined(this.scannedHeight)

    return this.scannedHeight + SYNC_THRESHOLD < this.blockHeight
  }

  async getSyncState(): Promise<SyncStats> {
    assertIsDefined(this.blockHeight)
    assertIsDefined(this.scannedHeight)

    return {
      syncedHeight: this.scannedHeight,
      blockHeight: this.blockHeight,
      syncProgress: this.scannedHeight / this.blockHeight,
      isSyncing: this.scannedHeight + SYNC_THRESHOLD < this.blockHeight,
    }
  }

  async fetchSyncProgress(): Promise<void> {
    const rawAddressData = await getAddressInfo()

    this.scannedHeight = rawAddressData.scanned_block_height as number
    this.blockHeight = rawAddressData.blockchain_height as number
    return
  }

  async updateSyncObservers(observers: SyncObserver[], syncState: SyncStats) {
    if (!(await this.isSyncing())) {
      observers.forEach((observer) => {
        observer.complete(syncState)
      })
    } else {
      observers.forEach((observer) => {
        observer.next(syncState)
      })
    }
  }

  purge() {
    this.blockHeight = undefined
    this.scannedHeight = undefined
    this.syncObservers = []
    if (this.updateSyncProgressIntervalID) {
      clearInterval(this.updateSyncProgressIntervalID)
      this.updateSyncProgressIntervalID = undefined
    }
  }
}

export { SyncHandler }
