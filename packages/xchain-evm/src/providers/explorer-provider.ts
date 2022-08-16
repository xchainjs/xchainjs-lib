import { Address } from '@xchainjs/xchain-client'

export class ExplorerProvider {
  private explorerUrl: string
  private explorerAddressUrlTemplate: string
  private explorerTxUrlTemplate: string

  constructor(explorerUrl: string, explorerAddressUrlTemplate: string, explorerTxUrlTemplate: string) {
    this.explorerUrl = explorerUrl
    this.explorerAddressUrlTemplate = explorerAddressUrlTemplate
    this.explorerTxUrlTemplate = explorerTxUrlTemplate
  }
  getExplorerUrl(): string {
    return this.explorerUrl
  }
  getExplorerAddressUrl(address: Address): string {
    return this.explorerAddressUrlTemplate.replace('%%ADDRESS%%', address)
  }
  getExplorerTxUrl(txID: string): string {
    return this.explorerTxUrlTemplate.replace('%%TX_ID%%', txID)
  }
}
