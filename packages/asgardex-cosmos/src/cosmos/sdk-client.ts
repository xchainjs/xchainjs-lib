import * as BIP39 from 'bip39'
import * as BIP32 from 'bip32'
import { BigSource } from 'big.js'

import { CosmosSDK, AccAddress, PrivKeyEd25519, PrivKey, Msg } from 'cosmos-client'
import { BroadcastTxCommitResult, Coin, PaginatedQueryTxs, StdTxFee, StdTxSignature } from 'cosmos-client/api'
import { auth, StdTx, BaseAccount } from 'cosmos-client/x/auth'
import { bank, MsgSend } from 'cosmos-client/x/bank'

import { Network } from '@asgardex-clients/asgardex-client'

export class CosmosSDKClient {
  sdk: CosmosSDK

  server: string
  chainId: string
  prefix: string = 'cosmos'
  network: Network = 'testnet'

  constructor(server: string, chainId: string) {
    this.server = server
    this.chainId = chainId
    this.sdk = new CosmosSDK(this.server, this.chainId)
    this.chooseNetwork('testnet')
  }

  chooseNetwork = (network: Network): void => {
    this.network = network
    AccAddress.setBech32Prefix(
      this.prefix,
      this.prefix + 'pub',
      this.prefix + 'valoper',
      this.prefix + 'valoperpub',
      this.prefix + 'valcons',
      this.prefix + 'valconspub',
    )
  }

  getAddressFromPrivKey = (privkey: PrivKey): string => {
    return AccAddress.fromPublicKey(privkey.getPubKey()).toBech32()
  }

  getPrivKeyFromMnemonic = (mnemonic: string): PrivKey => {
    const seed = BIP39.mnemonicToSeedSync(mnemonic)
    const node = BIP32.fromSeed(seed)
    const child = node.derivePath("44'/118'/0'/0/0")

    if (!child.privateKey) {
      throw new Error("child does not have a privateKey")
    }

    return new PrivKeyEd25519(child.privateKey)
  }

  checkAddress = (address: string): boolean => {
    try {
      if (!address.startsWith(this.prefix)) {
        return false
      }

      return AccAddress.fromBech32(address).toBech32() === address
    } catch (err) {
      return false
    }
  }

  getBalance = async (address: string): Promise<Coin[]> => {
    try {
      const accAddress = AccAddress.fromBech32(address)
      
      return bank.balancesAddressGet(this.sdk, accAddress).then((res) => res.data.result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  searchTx = async (
    messageAction?: string,
    messageSender?: string,
    page?: number,
    limit?: number,
    txMinHeight?: number,
    txMaxHeight?: number,
  ): Promise<PaginatedQueryTxs> => {
    try {
      return await auth
        .txsGet(this.sdk, messageAction, messageSender, page, limit, txMinHeight, txMaxHeight)
        .then(async (res) => res.data)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  transfer = async (
    privkey: PrivKey,
    from: string,
    to: string,
    amount: BigSource,
    asset: string,
    memo?: string,
  ): Promise<BroadcastTxCommitResult> => {
    try {
      const fromAddress = AccAddress.fromBech32(from)
      const toAddress = AccAddress.fromBech32(to)

      let account: BaseAccount = await auth.accountsAddressGet(this.sdk, fromAddress).then((res) => res.data.result)
      if (account.account_number === undefined) {
        account = BaseAccount.fromJSON((account as any).value)
      }

      // const unsignedStdTx = await bank
      //   .accountsAddressTransfersPost(this.sdk, toAddress, {
      //     base_req: {
      //       from,
      //       memo: memo,
      //       chain_id: this.sdk.chainID,
      //       account_number: account.account_number.toString(),
      //       sequence: account.sequence.toString(),
      //       gas: '',
      //       gas_adjustment: '',
      //       fees: [],
      //       simulate: false,
      //     },
      //     amount: [{ denom: asset, amount: amount.toString() }],
      //   })
      //   .then((res) => res.data)

      const msg: Msg = [
        MsgSend.fromJSON(
          {
            from_address: fromAddress.toBech32(),
            to_address: toAddress.toBech32(),
            amount: [{
              denom: asset,
              amount: amount.toString(),
            }]
          }
        )
      ]
      const fee: StdTxFee = {
        gas: '',
        amount: []
      }
      const signatures: StdTxSignature[] = []

      const unsignedStdTx = StdTx.fromJSON({
        msg,
        fee,
        signatures,
        memo,
      })

      const signedStdTx = auth.signStdTx(
        this.sdk,
        privkey,
        unsignedStdTx,
        account.account_number.toString(),
        account.sequence.toString(),
      )

      const result = await auth.txsPost(this.sdk, signedStdTx, 'block').then((res) => res.data)

      return result
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
