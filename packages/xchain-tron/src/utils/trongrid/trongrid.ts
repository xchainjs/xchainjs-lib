import { Tx, TxType, TxFrom, TxTo, TxsPage } from '@xchainjs/xchain-client'
import { AssetType, baseAmount } from '@xchainjs/xchain-util'
import TW, { TronWeb } from 'tronweb'
import type { TronGridAccountResponse, TronGridTransaction } from './types'
import { AssetTRX, TRX_DECIMAL, TRON_DEFAULT_RPC } from '../../const'

const TRONGRID_API_BASE_URL = 'https://api.trongrid.io'

export class TronGrid {
  public tronWeb: TronWeb

  constructor() {
    this.tronWeb = new TronWeb({ fullHost: TRON_DEFAULT_RPC })
  }

  public async getAccount(address: string) {
    try {
      const response = await fetch(`${TRONGRID_API_BASE_URL}/v1/accounts/${address}`)

      if (!response.ok) {
        throw new Error(`TronGrid API error: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as TronGridAccountResponse

      if (!(data.success && data.data) || data.data.length === 0) {
        throw new Error('Invalid response from TronGrid API')
      }

      let searchAddressHex: string
      try {
        searchAddressHex = TronWeb.address.toHex(address).toLowerCase()
      } catch {
        // If conversion fails, assume it's already hex
        searchAddressHex = address.toLowerCase()
      }

      const account = data.data.find((acc) => {
        return acc.address.toLowerCase() === searchAddressHex
      })

      if (!account) {
        return
      }

      return account
    } catch (error) {
      throw error
    }
  }

  public async getTransactions(params: { address: string; limit: number; offset: number }): Promise<TxsPage> {
    const { address, offset, limit } = params
    const url = `https://api.trongrid.io/v1/accounts/${address}/transactions?limit=${limit}&start=${offset}`
    const res = await fetch(url)
    const { data }: { data: TronGridTransaction[] } = await res.json()

    const txs: Tx[] = []

    for (const tx of data) {
      const contract = tx.raw_data.contract[0]

      if (contract.type === 'TransferContract') {
        const amount = baseAmount(contract.parameter.value.amount, TRX_DECIMAL)
        const from: TxFrom[] = [{ from: TronWeb.address.fromHex(contract.parameter.value.owner_address), amount }]
        const to: TxTo[] = [{ to: TronWeb.address.fromHex(contract.parameter.value.to_address), amount }]

        txs.push({
          asset: AssetTRX,
          type: TxType.Transfer,
          from,
          to,
          date: new Date(tx.block_timestamp as number),
          hash: tx.txID,
        })
        continue
      }

      if (contract.type === 'TriggerSmartContract') {
        const { contract_address, data: inputData, owner_address } = contract.parameter.value

        try {
          const decoded = TW.utils.abi.decodeParams(
            ['_to', '_value'],
            ['address', 'uint256'],
            inputData,
            true, // ignoreMethodHash skips the 4-byte selector
          )

          const toAddress = decoded._to
          const fromAddress = TronWeb.address.fromHex(owner_address)
          const rawValue = decoded._value.toString()

          const contractHex = TronWeb.address.fromHex(contract_address)
          const tokenContract = await this.tronWeb.contract().at(contractHex)

          const symbol: string = await tokenContract.symbol().call()
          const decimals: number = await tokenContract.decimals().call()

          const amount = baseAmount(rawValue, decimals)
          const from: TxFrom[] = [{ from: fromAddress, amount }]
          const to: TxTo[] = [{ to: toAddress, amount }]
          const asset = {
            chain: 'TRON',
            symbol: `${symbol}-${contract_address}`,
            ticker: symbol,
            type: AssetType.TOKEN,
          }

          txs.push({
            asset,
            type: TxType.Transfer,
            from,
            to,
            date: new Date(tx.block_timestamp as number),
            hash: tx.txID,
          })
        } catch (_e) {
          // Not an ERC20 transfer (could be another contract call)
          continue
        }
      }
    }

    return {
      total: txs.length,
      txs,
    }
  }

  public async getTransactionData(txId: string): Promise<Tx> {
    const url = `${TRONGRID_API_BASE_URL}/walletsolidity/gettransactionbyid`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: txId }),
    })

    const tx: TronGridTransaction = await res.json()
    if (!tx || !tx.raw_data?.contract?.length) {
      throw new Error('Transaction not found')
    }

    const contract = tx.raw_data.contract[0]

    if (contract.type === 'TransferContract') {
      const amount = baseAmount(contract.parameter.value.amount, TRX_DECIMAL)
      const from: TxFrom[] = [{ from: TronWeb.address.fromHex(contract.parameter.value.owner_address), amount }]
      const to: TxTo[] = [{ to: TronWeb.address.fromHex(contract.parameter.value.to_address), amount }]

      return {
        asset: AssetTRX,
        type: TxType.Transfer,
        from,
        to,
        date: new Date(tx.raw_data.timestamp ?? Date.now()),
        hash: tx.txID,
      }
    }

    // walletsolidity does not pre-parse TRC20 transfers.
    if (contract.type === 'TriggerSmartContract') {
      const { owner_address, contract_address, data: inputData } = contract.parameter.value

      // ERC20 transfer selector = a9059cbb
      if (inputData.startsWith('a9059cbb')) {
        const decoded = TW.utils.abi.decodeParams(
          ['_to', '_value'],
          ['address', 'uint256'],
          inputData,
          true, // ignoreMethodHash skips the 4-byte selector
        )

        const toAddress = TronWeb.address.fromHex(decoded._to)
        const fromAddress = TronWeb.address.fromHex(owner_address)
        const rawValue = decoded._value.toString()

        // should set owner_address
        this.tronWeb.setAddress(fromAddress)
        const contract = TronWeb.address.fromHex(contract_address)
        const tokenContract = await this.tronWeb.contract().at(contract)

        const symbol: string = await tokenContract.symbol().call()
        const decimals: number = await tokenContract.decimals().call()

        const amount = baseAmount(rawValue, decimals)
        const from: TxFrom[] = [{ from: fromAddress, amount }]
        const to: TxTo[] = [{ to: toAddress, amount }]
        const asset = {
          chain: 'TRON',
          symbol: `${symbol}-${contract_address}`,
          ticker: symbol,
          type: AssetType.TOKEN,
        }

        return {
          asset,
          type: TxType.Transfer,
          from,
          to,
          date: new Date(tx.raw_data.timestamp as number),
          hash: tx.txID,
        }
      }
    }

    throw new Error(`Unsupported or non-transfer transaction: ${contract.type}`)
  }
}
