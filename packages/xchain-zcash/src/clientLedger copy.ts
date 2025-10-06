import { TxHash, checkFeeBounds, FeeRate, FeeOption } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { UtxoClientParams, TxParams, UTXO } from '@xchainjs/xchain-utxo'
import type Transport from '@ledgerhq/hw-transport'
import UtxoApp from '@ledgerhq/hw-app-btc'
import type { Transaction as LedgerTransaction } from '@ledgerhq/hw-app-btc/lib/types'
import { bitgo, networks, Transaction, address as zcashAddress } from '@bitgo/utxo-lib'
import type { ZcashPsbt } from '@bitgo/utxo-lib/dist/src/bitgo'

import accumulative from 'coinselect/accumulative.js'

import { Client } from './client'

export type UtxoLedgerClientParams = UtxoClientParams & { transport: Transport }

class ClientLedger extends Client {
  private transport: Transport
  private ledgerApp: UtxoApp | undefined

  constructor(params: UtxoLedgerClientParams) {
    super(params)
    this.transport = params.transport
  }

  public createLedgerTransport(): UtxoApp {
    this.ledgerApp = new UtxoApp({ currency: 'zcash', transport: this.transport })
    return this.ledgerApp
  }

  public getLedgerApp(): UtxoApp {
    if (this.ledgerApp) return this.ledgerApp
    return this.createLedgerTransport()
  }

  // Not supported for ledger client
  getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  async getAddressAsync(index = 0): Promise<Address> {
    const ledgerApp = this.getLedgerApp()
    const derivationPath = this.getFullDerivationPath(index)
    const { bitcoinAddress: address } = await ledgerApp.getWalletPublicKey(derivationPath, { format: 'legacy' })
    return address
  }

  async buildTx({
    amount,
    recipient,
    memo,
    feeRate,
    sender,
  }: TxParams & { sender: string; feeRate: FeeRate }): Promise<{ psbt: ZcashPsbt; utxos: UTXO[]; inputs: UTXO[] }> {
    // Check memo length
    if (memo && memo.length > 80) {
      throw new Error('memo too long, must not be longer than 80 chars.')
    }
    // This section of the code is responsible for preparing a transaction by building a Bitcoin PSBT (Partially Signed Bitcoin Transaction).
    if (!this.validateAddress(recipient)) throw new Error('Invalid address')
    // Determine whether to only use confirmed UTXOs or include pending UTXOs based on the spendPendingUTXO flag.

    // Scan UTXOs associated with the sender's address.
    const utxos = await this.scanUTXOs(sender, true)
    // Throw an error if there are no available UTXOs to cover the transaction.
    if (utxos.length === 0) throw new Error('Insufficient Balance for transaction')
    // Round up the fee rate to the nearest integer.
    const feeRateWhole = Math.ceil(feeRate)
    // Compile the memo into a Buffer if provided.
    const compiledMemo = memo ? this.compileMemo(memo) : null
    // Initialize an array to store the target outputs of the transaction.
    const targetOutputs = []

    // 1. Add the recipient address and amount to the target outputs.
    targetOutputs.push({
      address: recipient,
      value: amount.amount().toNumber(),
    })
    // 2. Add the compiled memo to the target outputs if it exists.
    if (compiledMemo) {
      targetOutputs.push({ script: compiledMemo, value: 0 })
    }

    // Use the coinselect library to determine the inputs and outputs for the transaction.
    const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole)
    // If no suitable inputs or outputs are found, throw an error indicating insufficient balance.
    if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction')

    const psbt = bitgo.createPsbtForNetwork({ network: networks.zcash }, { version: 455 }) as ZcashPsbt

    const NU5 = 0xc2d6d0b4
    const branchId = NU5
    const CONSENSUS_BRANCH_ID_KEY = Buffer.concat([
      Buffer.of(0xfc),
      Buffer.of(0x05),
      Buffer.from('BITGO'),
      Buffer.of(0),
    ])

    // PSBT value must be 4-byte little-endian
    const value = Buffer.allocUnsafe(4)
    value.writeUInt32LE(branchId, 0)

    psbt.addUnknownKeyValToGlobal({ key: CONSENSUS_BRANCH_ID_KEY, value })

    console.log('inputs', inputs)
    console.log('outputs', outputs)
    // add inputs and outputs
    for (const utxo of inputs) {
      const witnessInfo = !!utxo.witnessUtxo && { witnessUtxo: { ...utxo.witnessUtxo, value: BigInt(utxo.value) } }

      const nonWitnessInfo = !utxo.witnessUtxo && {
        nonWitnessUtxo: utxo.txHex ? Buffer.from(utxo.txHex, 'hex') : undefined,
      }

      const input = { hash: utxo.hash, index: utxo.index, ...witnessInfo, ...nonWitnessInfo }
      console.log('psbt input', input)
      psbt.addInput(input)
    }

    for (const output of outputs) {
      const address = 'address' in output && output.address ? output.address : sender
      const hasOutputScript = output.script

      if (hasOutputScript && !compiledMemo) {
        continue
      }

      const mappedOutput = hasOutputScript
        ? { script: compiledMemo as Buffer<ArrayBufferLike>, value: BigInt(0) }
        : { script: zcashAddress.toOutputScript(address, networks.zcash), value: BigInt(output.value) }

      psbt.addOutput(mappedOutput)
    }

    return {
      psbt,
      utxos,
      inputs,
    }
  }

  /**
   * Transfer ZEC using Ledger.
   * @param {TxParams&FeeRate} params The transfer options including the fee rate.
   * @returns {Promise<TxHash|string>} A promise that resolves to the transaction hash or an error message.
   * @throws {"memo too long"} Thrown if the memo is longer than 80 characters.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const ledgerApp = this.getLedgerApp()

    // Get fee rate
    const feeRate = params.feeRate || (await this.getFees())[FeeOption.Fast].amount().toNumber()
    // Check if the fee rate is within the fee bounds
    checkFeeBounds(this.feeBounds, feeRate)

    // Get the address index from the parameters or use the default value
    const fromAddressIndex = params?.walletIndex || 0
    const sender = await this.getAddressAsync(fromAddressIndex)

    // Prepare psbt
    const { psbt, inputs } = await this.buildTx({ ...params, sender, feeRate })
    console.log('inputs', inputs)
    // Prepare Ledger inputs
    const ledgerInputs: [LedgerTransaction, number, string | null, number | null][] = (inputs as UTXO[]).map(
      ({ txHex, index }) => {
        const splittedTx = ledgerApp.splitTransaction(
          txHex || '',
          false, // Zcash doesn't support segwit
          true, // set hasExtraData: true
          ['zcash'],
        )
        return [splittedTx, index, null, null]
      },
    )

    // Prepare associated keysets
    const associatedKeysets = ledgerInputs.map(() => this.getFullDerivationPath(fromAddressIndex))
    // Serialize unsigned transaction
    const unsignedHex = psbt.data.globalMap.unsignedTx.toBuffer().toString('hex')
    const newTx = ledgerApp.splitTransaction(unsignedHex, false, true, ['zcash'])
    const outputScriptHex = ledgerApp.serializeTransactionOutputs(newTx).toString('hex')

    // Create payment transaction
    const txHex = await ledgerApp.createPaymentTransaction({
      inputs: ledgerInputs,
      associatedKeysets,
      outputScriptHex,
      segwit: false,
      useTrustedInputForSegwit: false,
      lockTime: 0,
      expiryHeight: (() => {
        const buf = Buffer.allocUnsafe(4)
        buf.writeUInt32LE(0)
        return buf
      })(),
      additionals: ['zcash'],
    })

    console.log('signed txHex', txHex)

    const txId = await this.roundRobinBroadcastTx(txHex)
    return txId
  }
}

export { ClientLedger }
