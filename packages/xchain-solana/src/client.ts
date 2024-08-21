import { isAddress } from '@solana/addresses'
import { Keypair } from '@solana/web3.js'
import { AssetInfo, Balance, BaseXChainClient, Fees, PreparedTx, Tx, TxHash, TxsPage } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { HDKey } from 'micro-ed25519-hdkey'

import { SOLChain, defaultSolanaParams } from './const'
import { SOLClientParams } from './types'

export class Client extends BaseXChainClient {
  constructor(params: SOLClientParams = defaultSolanaParams) {
    super(SOLChain, {
      ...defaultSolanaParams,
      ...params,
    })
  }

  getExplorerUrl(): string {
    throw new Error('Method not implemented.')
  }

  getExplorerAddressUrl(): string {
    throw new Error('Method not implemented.')
  }

  getExplorerTxUrl(): string {
    throw new Error('Method not implemented.')
  }

  public getAddress(index = 0): string {
    if (!this.phrase) throw new Error('Phrase must be provided')

    const seed = getSeed(this.phrase)
    const hd = HDKey.fromMasterSeed(seed.toString('hex'))

    const keypair = Keypair.fromSeed(hd.derive(this.getFullDerivationPath(index || 0), true).privateKey)

    return keypair.publicKey.toBase58()
  }

  public validateAddress(address: Address): boolean {
    return isAddress(address)
  }

  public async getAddressAsync(index?: number): Promise<string> {
    return this.getAddress(index)
  }

  getFees(): Promise<Fees> {
    throw new Error('Method not implemented.')
  }

  getBalance(): Promise<Balance[]> {
    throw new Error('Method not implemented.')
  }

  getTransactions(): Promise<TxsPage> {
    throw new Error('Method not implemented.')
  }

  getTransactionData(): Promise<Tx> {
    throw new Error('Method not implemented.')
  }

  transfer(): Promise<string> {
    throw new Error('Method not implemented.')
  }

  broadcastTx(): Promise<TxHash> {
    throw new Error('Method not implemented.')
  }

  getAssetInfo(): AssetInfo {
    throw new Error('Method not implemented.')
  }

  prepareTx(): Promise<PreparedTx> {
    throw new Error('Method not implemented.')
  }
}
