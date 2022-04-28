export interface HavenClient {
  isSyncing(): boolean
  syncHeight(): number
  blockHeight(): number
  getAddressAsync(walletIndex?: number): Promise<string>
}
