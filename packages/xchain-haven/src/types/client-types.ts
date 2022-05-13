import { SyncObserver } from '../haven/types'

export interface HavenClient {
  isSyncing(): Promise<boolean>
  subscribeSyncProgress(observer: SyncObserver): void
  preloadSDK(): Promise<boolean>
}
