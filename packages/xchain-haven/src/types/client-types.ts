export interface HavenClient {
  isSyncing(): boolean
  syncHeight(): number
  blockHeight(): number
}
