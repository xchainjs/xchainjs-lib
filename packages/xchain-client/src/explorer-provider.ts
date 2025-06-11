import { Address } from '@xchainjs/xchain-util'
/**
 * ExplorerProvider class is responsible for generating URLs for blockchain explorers.
 * It constructs explorer URLs and replaces placeholders with specific addresses or transaction IDs.
 */
export class ExplorerProvider {
  private explorerUrl: string // The base URL of the blockchain explorer
  private explorerAddressUrlTemplate: string // The template URL for address exploration
  private explorerTxUrlTemplate: string // The template URL for transaction exploration

  /**
   * Constructor for ExplorerProvider class.
   *
   * @param {string} explorerUrl The base URL of the blockchain explorer
   * @param {string} explorerAddressUrlTemplate The template URL for address exploration
   * @param {string} explorerTxUrlTemplate The template URL for transaction exploration
   */
  constructor(explorerUrl: string, explorerAddressUrlTemplate: string, explorerTxUrlTemplate: string) {
    this.explorerUrl = explorerUrl // Initialize explorerUrl property
    this.explorerAddressUrlTemplate = explorerAddressUrlTemplate // Initialize explorerAddressUrlTemplate property
    this.explorerTxUrlTemplate = explorerTxUrlTemplate // Initialize explorerTxUrlTemplate property
  }

  /**
   * Get the base URL of the blockchain explorer.
   *
   * @returns {string} The base URL of the blockchain explorer
   */
  getExplorerUrl(): string {
    return this.explorerUrl // Return the explorerUrl property
  }

  /**
   * Get the URL for exploring a specific address.
   *
   * @param {Address} address The address to be explored
   * @returns {string} The URL for exploring the specified address
   */
  getExplorerAddressUrl(address: Address): string {
    return this.explorerAddressUrlTemplate.replace('%%ADDRESS%%', address) // Replace the placeholder in the URL with the specified address
  }

  /**
   * Get the URL for exploring a specific transaction.
   *
   * @param {string} txID The transaction ID to be explored
   * @returns {string} The URL for exploring the specified transaction
   */
  getExplorerTxUrl(txID: string): string {
    return this.explorerTxUrlTemplate.replace('%%TX_ID%%', txID) // Replace the placeholder in the URL with the specified transaction ID
  }
}
