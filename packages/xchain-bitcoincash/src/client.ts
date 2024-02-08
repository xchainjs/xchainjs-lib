// Import statements for necessary modules and types
import * as bitcash from '@psf/bitcoincashjs-lib'
import { AssetInfo, FeeOption, FeeRate, Network, TxHash, TxParams, checkFeeBounds } from '@xchainjs/xchain-client'; // Importing various types and constants from xchain-client module
import { getSeed } from '@xchainjs/xchain-crypto'; // Importing getSeed function from xchain-crypto module
import { Address } from '@xchainjs/xchain-util'; // Importing the Address type from xchain-util module
import { Client as UTXOClient, UTXO, UtxoClientParams } from '@xchainjs/xchain-utxo'; // Importing necessary types and the UTXOClient class from xchain-utxo module
import accumulative from 'coinselect/accumulative'; // Importing accumulative function from coinselect/accumulative module

import {
  AssetBCH,
  BCHChain,
  BCH_DECIMAL,
  BitgoProviders,
  HaskoinDataProviders,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  explorerProviders,
} from './const'; // Importing various constants from the const module
import { BchPreparedTx } from './types'; // Importing the BchPreparedTx type from types module
import { KeyPair, Transaction, TransactionBuilder } from './types/bitcoincashjs-types'; // Importing necessary types from bitcoincashjs-types module
import * as Utils from './utils'; // Importing utility functions from utils module
// Default parameters for Bitcoin Cash (BCH) client
export const defaultBchParams: UtxoClientParams = {
  network: Network.Mainnet, // Default network is Mainnet
  phrase: '', // Default empty phrase
  explorerProviders: explorerProviders, // Default explorer providers
  dataProviders: [BitgoProviders, HaskoinDataProviders], // Default data providers
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/145'/0'/0/`, // Default root derivation path for Mainnet
    [Network.Testnet]: `m/44'/1'/0'/0/`, // Default root derivation path for Testnet
    [Network.Stagenet]: `m/44'/145'/0'/0/`, // Default root derivation path for Stagenet
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND, // Default lower fee bound
    upper: UPPER_FEE_BOUND, // Default upper fee bound
  },
};
/**
 * Custom Bitcoin Cash client class.
 */
class Client extends UTXOClient {
  /**
   * Constructor for the Client class.
   *
   * @param {UtxoClientParams} params - Parameters for initializing the client.
   */
  constructor(params = defaultBchParams) {
    // Call the constructor of the parent class (UTXOClient) with BCHChain as the chain and provided parameters
    super(BCHChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    });
  }
  /**
   * Get the current address.
   *
   * Generates a network-specific key-pair and returns the corresponding address.
   *
   * @param {number} index - The index of the address to retrieve.
   * @returns {Address} The current address.
   *
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   * @throws {"Address not defined"} Thrown if failed to create account from phrase.
   */
  getAddress(index = 0): Address {
    if (!this.phrase) throw new Error('Phrase must be provided'); // Throw an error if the phrase is not provided
    try {
      const keys = this.getBCHKeys(this.phrase, this.getFullDerivationPath(index)); // Get BCH keys
      const address = keys.getAddress(index); // Get the address from the keys
      return Utils.stripPrefix(Utils.toCashAddress(address)); // Return the address with prefix stripped
    } catch (error) {
      throw new Error('Address not defined'); // Throw an error if failed to create account from phrase
    }
  }

  /**
   * Get the current address asynchronously.
   * Generates a network-specific key-pair and returns the corresponding address.
   * @returns {Address} A promise that resolves with the current address.
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   * @throws {"Address not defined"} Thrown if failed to create account from phrase.
   */
  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  /**
   * Get information about the BCH asset.
   * @returns Information about the BCH asset.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetBCH, // Asset symbol
      decimal: BCH_DECIMAL, // Decimal precision
    }
    return assetInfo
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * Private function to get BCH keys.
   * Generates a key pair from the provided phrase and derivation path.
   * @param {string} phrase - The phrase used for generating the private key.
   * @param {string} derivationPath - The BIP44 derivation path.
   * @returns {PrivateKey} The key pair generated from the phrase and derivation path.
   *
   * @throws {"Invalid phrase"} Thrown if an invalid phrase is provided.
   * */
  private getBCHKeys(phrase: string, derivationPath: string): KeyPair {
    const rootSeed = getSeed(phrase); // Get seed from the phrase
    const masterHDNode = bitcash.HDNode.fromSeedBuffer(rootSeed, Utils.bchNetwork(this.network)); // Create HD node from seed
    return masterHDNode.derivePath(derivationPath).keyPair; // Derive key pair from the HD node and derivation path
  }
  /**
 * Transfer BCH.
 * @param {TxParams & { feeRate?: FeeRate }} params - The transfer options.
 * @returns {Promise<TxHash>} A promise that resolves with the transaction hash.
 */
async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
  // Set the default fee rate to 'fast'
  const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast];
  // Check if the fee rate is within the specified bounds
  checkFeeBounds(this.feeBounds, feeRate);

  // Get the index of the address to send funds from
  const fromAddressIndex = params.walletIndex || 0;

  // Prepare the transaction by gathering necessary data
  const { rawUnsignedTx, utxos } = await this.prepareTx({
    ...params,
    feeRate,
    sender: await this.getAddressAsync(fromAddressIndex),
  });

  // Convert the raw unsigned transaction to a Transaction object
  const tx: Transaction = bitcash.Transaction.fromHex(rawUnsignedTx);

  // Initialize a new transaction builder
  const builder: TransactionBuilder = new bitcash.TransactionBuilder(Utils.bchNetwork(this.network));

  // Add inputs to the transaction builder
  tx.ins.forEach((input) => {
    const utxo = utxos.find(
      (utxo) =>
        Buffer.compare(Buffer.from(utxo.hash, 'hex').reverse(), input.hash) === 0 && input.index === utxo.index,
    );
    if (!utxo) throw Error('Can not find UTXO');
    builder.addInput(bitcash.Transaction.fromBuffer(Buffer.from(utxo.txHex || '', 'hex')), utxo.index);
  });

  // Add outputs to the transaction builder
  tx.outs.forEach((output) => {
    builder.addOutput(output.script, output.value);
  });

  // Get the derivation path for the sender's address
  const derivationPath = this.getFullDerivationPath(fromAddressIndex);
  // Get the key pair for signing the transaction
  const keyPair = this.getBCHKeys(this.phrase, derivationPath);

  // Sign each input of the transaction with the key pair
  builder.inputs.forEach((input: { value: number }, index: number) => {
    builder.sign(index, keyPair, undefined, 0x41, input.value);
  });

  // Build the final transaction and convert it to hexadecimal format
  const txHex = builder.build().toHex();

  // Broadcast the transaction to the BCH network and return the transaction hash
  return await this.roundRobinBroadcastTx(txHex);
}

/**
 * Build a BCH transaction.
 * @param {BuildParams} params - The transaction build options.
 * @returns {Transaction} A promise that resolves with the transaction builder, UTXOs, and inputs.
 * @deprecated
 */
async buildTx({
  amount,
  recipient,
  memo,
  feeRate,
  sender,
}: TxParams & {
  feeRate: FeeRate;
  sender: Address;
}): Promise<{
  builder: TransactionBuilder;
  utxos: UTXO[];
  inputs: UTXO[];
}> {
  // Convert recipient address to CashAddress format
  const recipientCashAddress = Utils.toCashAddress(recipient);
  // Validate recipient address
  if (!this.validateAddress(recipientCashAddress)) throw new Error('Invalid address');

  // Scan UTXOs for the sender address
  const utxos = await this.scanUTXOs(sender, false);
  // Throw error if no UTXOs are found
  if (utxos.length === 0) throw new Error('No utxos to send');

  // Convert fee rate to a whole number
  const feeRateWhole = Number(feeRate.toFixed(0));
  // Compile memo if provided
  const compiledMemo = memo ? this.compileMemo(memo) : null;

  const targetOutputs = [];

  // Add output amount and recipient to target outputs
  targetOutputs.push({
    address: recipient,
    value: amount.amount().toNumber(),
  });

  // Calculate transaction inputs and outputs
  const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole);

  // Throw error if no solution is found
  if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction');

  // Initialize a new transaction builder
  const transactionBuilder = new bitcash.TransactionBuilder(Utils.bchNetwork(this.network));

  // Add inputs to the transaction builder
  inputs.forEach((utxo: UTXO) =>
    transactionBuilder.addInput(bitcash.Transaction.fromBuffer(Buffer.from(utxo.txHex || '', 'hex')), utxo.index),
  );

  // Add outputs to the transaction builder
  outputs.forEach((output: any) => {
    let out = undefined;
    if (!output.address) {
      // An empty address means this is the change address
      out = bitcash.address.toOutputScript(Utils.toLegacyAddress(sender), Utils.bchNetwork(this.network));
    } else if (output.address) {
      out = bitcash.address.toOutputScript(Utils.toLegacyAddress(output.address), Utils.bchNetwork(this.network));
    }
    transactionBuilder.addOutput(out, output.value);
  });

  // Add output for memo if compiled
  if (compiledMemo) {
    transactionBuilder.addOutput(compiledMemo, 0); // Add OP_RETURN {script, value}
  }

  // Return transaction builder, UTXOs, and inputs
  return {
    builder: transactionBuilder,
    utxos,
    inputs,
  };
}
  /**
   * Prepare a BCH transaction.
   * @param {TxParams&Address&FeeRate} params - The transaction preparation options.
   * @returns {PreparedTx} A promise that resolves with the prepared transaction and UTXOs.
   */
  async prepareTx({
    sender,
    memo,
    amount,
    recipient,
    feeRate,
  }: TxParams & {
    sender: Address
    feeRate: FeeRate
    }): Promise<BchPreparedTx> {
    // Build the transaction using provided options
    const { builder, utxos } = await this.buildTx({
      sender,
      recipient,
      amount,
      memo,
      feeRate,
    })
    // Return the raw unsigned transaction and UTXOs
    return { rawUnsignedTx: builder.buildIncomplete().toHex(), utxos }
  }
  /**
 * Compile a memo.
 * @param {string} memo - The memo to be compiled.
 * @returns {Buffer} - The compiled memo.
 */
  protected compileMemo(memo: string): Buffer {
    const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
    return bitcash.script.compile([bitcash.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
  }
  /**
   * Calculate the transaction fee.
   * @param {UTXO[]} inputs - The UTXOs.
   * @param {FeeRate} feeRate - The fee rate.
   * @param {Buffer | null} data - The compiled memo (optional).
   * @returns {number} - The fee amount.
   */
  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number {
    let totalWeight = Utils.TX_EMPTY_SIZE
    totalWeight += (Utils.TX_INPUT_PUBKEYHASH + Utils.TX_INPUT_BASE) * inputs.length
    totalWeight += (Utils.TX_OUTPUT_BASE + Utils.TX_OUTPUT_PUBKEYHASH) * 2
    if (data) {
      totalWeight += 9 + data.length
    }
    return Math.ceil(totalWeight * feeRate)
  }
}

export { Client }
