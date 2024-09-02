import { AccountInfo, ParsedAccountData, ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js'

const realPackage = jest.requireActual('@solana/web3.js')

class Connection {
  async getBalance(pk: PublicKey): Promise<number> {
    if (pk.toBase58() === '94bPUbh8iazbg2UgUDrmMkgWoZz9Q1H813JZifZRB35v') {
      return 1_000_000_000
    }
    return 0
  }

  async getParsedTokenAccountsByOwner(pk: PublicKey): Promise<{
    value: {
      pubkey: PublicKey
      account: AccountInfo<ParsedAccountData>
    }[]
  }> {
    if (pk.toBase58() === '94bPUbh8iazbg2UgUDrmMkgWoZz9Q1H813JZifZRB35v') {
      return {
        value: [
          {
            account: {
              data: {
                parsed: {
                  info: {
                    isNative: false,
                    mint: '8zMTcsEFiB12NKrM5QXWL5pw1QMNJrAhH6Kh278YWFRY',
                    owner: '94bPUbh8iazbg2UgUDrmMkgWoZz9Q1H813JZifZRB35v',
                    state: 'initialized',
                    tokenAmount: {
                      amount: '756181',
                      decimals: 6,
                      uiAmount: 0.756181,
                      uiAmountString: '0.756181',
                    },
                  },
                  type: 'account',
                },
                program: 'spl-token',
                space: 165,
              },
              executable: false,
              lamports: 2039280,
              owner: new PublicKey('94bPUbh8iazbg2UgUDrmMkgWoZz9Q1H813JZifZRB35v'),
              rentEpoch: 18446744073709552000,
            },
            pubkey: new PublicKey('8zMTcsEFiB12NKrM5QXWL5pw1QMNJrAhH6Kh278YWFRY'),
          },
          {
            account: {
              data: {
                parsed: {
                  info: {
                    isNative: false,
                    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
                    owner: '94bPUbh8iazbg2UgUDrmMkgWoZz9Q1H813JZifZRB35v',
                    state: 'initialized',
                    tokenAmount: {
                      amount: '54587',
                      decimals: 6,
                      uiAmount: 0.054587,
                      uiAmountString: '0.054587',
                    },
                  },
                  type: 'account',
                },
                program: 'spl-token',
                space: 165,
              },
              executable: false,
              lamports: 2039280,
              owner: new PublicKey('94bPUbh8iazbg2UgUDrmMkgWoZz9Q1H813JZifZRB35v'),
              rentEpoch: 18446744073709552000,
            },
            pubkey: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
          },
        ],
      }
    }
    return {
      value: [],
    }
  }

  public async getParsedTransaction(signature: string): Promise<ParsedTransactionWithMeta | null> {
    if (signature === 'fakeNativeSignature') {
      return {
        blockTime: 1724933679,
        meta: {
          computeUnitsConsumed: 150,
          err: null,
          fee: 5000,
          innerInstructions: [],
          logMessages: [
            'Program 11111111111111111111111111111111 invoke [1]',
            'Program 11111111111111111111111111111111 success',
          ],
          postBalances: [139522247, 10000000, 1],
          postTokenBalances: [],
          preBalances: [144527247, 5000000, 1],
          preTokenBalances: [],
        },
        slot: 286544924,
        transaction: {
          message: {
            accountKeys: [
              {
                pubkey: new PublicKey('DTHVAEEC6cJyHsmYYmCQvX2eEtgoXSeyGoRhLZvcf62s'),
                signer: true,
                source: 'transaction',
                writable: true,
              },
              {
                pubkey: new PublicKey('FH6wye9tmorZMXLisVx9ZpZXDKvcSgasJtJoCXizSn36'),
                signer: false,
                source: 'transaction',
                writable: true,
              },
              {
                pubkey: new PublicKey('11111111111111111111111111111111'),
                signer: false,
                source: 'transaction',
                writable: false,
              },
            ],
            instructions: [
              {
                parsed: {
                  info: {
                    destination: 'FH6wye9tmorZMXLisVx9ZpZXDKvcSgasJtJoCXizSn36',
                    lamports: 5000000,
                    source: 'DTHVAEEC6cJyHsmYYmCQvX2eEtgoXSeyGoRhLZvcf62s',
                  },
                  type: 'transfer',
                },
                program: 'system',
                programId: new PublicKey('11111111111111111111111111111111'),
              },
            ],
            recentBlockhash: 'BPsS7ZC39SijJZowDUXg7c7j7aNQxCMkEKgcNge9iWpE',
          },
          signatures: ['fakeNativeSignature'],
        },
      }
    }
    if (signature === 'fakeTokenSignature') {
      return {
        blockTime: 1724758709,
        meta: {
          computeUnitsConsumed: 25308,
          err: null,
          fee: 15000,
          innerInstructions: [
            {
              index: 0,
              instructions: [
                {
                  parsed: {
                    info: {
                      extensionTypes: ['immutableOwner'],
                      mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
                    },
                    type: 'getAccountDataSize',
                  },
                  program: 'spl-token',
                  programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
                },
                {
                  parsed: {
                    info: {
                      lamports: 2039280,
                      newAccount: 'BfJjcYwnm8JmYg1AxquTHqtc35DJFt3swfQKEGbGj3CU',
                      owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                      source: 'AaZkwhkiDStDcgrU37XAj9fpNLrD8Erz5PNkdm4k5hjy',
                      space: 165,
                    },
                    type: 'createAccount',
                  },
                  program: 'system',
                  programId: new PublicKey('11111111111111111111111111111111'),
                },
                {
                  parsed: {
                    info: {
                      account: 'BfJjcYwnm8JmYg1AxquTHqtc35DJFt3swfQKEGbGj3CU',
                    },
                    type: 'initializeImmutableOwner',
                  },
                  program: 'spl-token',
                  programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
                },
                {
                  parsed: {
                    info: {
                      account: 'BfJjcYwnm8JmYg1AxquTHqtc35DJFt3swfQKEGbGj3CU',
                      mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
                      owner: 'DTHVAEEC6cJyHsmYYmCQvX2eEtgoXSeyGoRhLZvcf62s',
                    },
                    type: 'initializeAccount3',
                  },
                  program: 'spl-token',
                  programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
                },
              ],
            },
          ],
          logMessages: [
            'Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL invoke [1]',
            'Program log: Create',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
            'Program log: Instruction: GetAccountDataSize',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 1622 of 394555 compute units',
            'Program return: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA pQAAAAAAAAA=',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
            'Program 11111111111111111111111111111111 invoke [2]',
            'Program 11111111111111111111111111111111 success',
            'Program log: Initialize the associated token account',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
            'Program log: Instruction: InitializeImmutableOwner',
            'Program log: Please upgrade to SPL Token 2022 for immutable owner support',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 1405 of 387915 compute units',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
            'Program log: Instruction: InitializeAccount3',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4241 of 384031 compute units',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
            'Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL consumed 20514 of 400000 compute units',
            'Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL success',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [1]',
            'Program log: Instruction: Transfer',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4644 of 379486 compute units',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
            'Program ComputeBudget111111111111111111111111111111 invoke [1]',
            'Program ComputeBudget111111111111111111111111111111 success',
          ],
          postBalances: [598763210025, 2039280, 2039280, 731913600, 151576527, 87637392404, 1, 934087680, 1],
          postTokenBalances: [
            {
              accountIndex: 1,
              mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
              owner: 'DTHVAEEC6cJyHsmYYmCQvX2eEtgoXSeyGoRhLZvcf62s',
              uiTokenAmount: {
                amount: '25009340',
                decimals: 6,
                uiAmount: 25.00934,
                uiAmountString: '25.00934',
              },
            },
            {
              accountIndex: 2,
              mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
              owner: 'AaZkwhkiDStDcgrU37XAj9fpNLrD8Erz5PNkdm4k5hjy',
              uiTokenAmount: {
                amount: '169628681246',
                decimals: 6,
                uiAmount: 169628.681246,
                uiAmountString: '169628.681246',
              },
            },
          ],
          preBalances: [598765264305, 0, 2039280, 731913600, 151576527, 87637392404, 1, 934087680, 1],
          preTokenBalances: [
            {
              accountIndex: 2,
              mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
              owner: 'AaZkwhkiDStDcgrU37XAj9fpNLrD8Erz5PNkdm4k5hjy',
              uiTokenAmount: {
                amount: '169653690586',
                decimals: 6,
                uiAmount: 169653.690586,
                uiAmountString: '169653.690586',
              },
            },
          ],
        },
        slot: 286137085,
        transaction: {
          message: {
            accountKeys: [
              {
                pubkey: new PublicKey('AaZkwhkiDStDcgrU37XAj9fpNLrD8Erz5PNkdm4k5hjy'),
                signer: true,
                source: 'transaction',
                writable: true,
              },
              {
                pubkey: new PublicKey('BfJjcYwnm8JmYg1AxquTHqtc35DJFt3swfQKEGbGj3CU'),
                signer: false,
                source: 'transaction',
                writable: true,
              },
              {
                pubkey: new PublicKey('Gjufi2NCUkgEoGgkJmjmASQgsxPhJQSD4CNrK2bst4J6'),
                signer: false,
                source: 'transaction',
                writable: true,
              },
              {
                pubkey: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
                signer: false,
                source: 'transaction',
                writable: false,
              },
              {
                pubkey: new PublicKey('DTHVAEEC6cJyHsmYYmCQvX2eEtgoXSeyGoRhLZvcf62s'),
                signer: false,
                source: 'transaction',
                writable: false,
              },
              {
                pubkey: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
                signer: false,
                source: 'transaction',
                writable: false,
              },
              {
                pubkey: new PublicKey('11111111111111111111111111111111'),
                signer: false,
                source: 'transaction',
                writable: false,
              },
              {
                pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
                signer: false,
                source: 'transaction',
                writable: false,
              },
              {
                pubkey: new PublicKey('ComputeBudget111111111111111111111111111111'),
                signer: false,
                source: 'transaction',
                writable: false,
              },
            ],
            instructions: [
              {
                parsed: {
                  info: {
                    account: 'BfJjcYwnm8JmYg1AxquTHqtc35DJFt3swfQKEGbGj3CU',
                    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
                    source: 'AaZkwhkiDStDcgrU37XAj9fpNLrD8Erz5PNkdm4k5hjy',
                    systemProgram: '11111111111111111111111111111111',
                    tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    wallet: 'DTHVAEEC6cJyHsmYYmCQvX2eEtgoXSeyGoRhLZvcf62s',
                  },
                  type: 'create',
                },
                program: 'spl-associated-token-account',
                programId: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
              },
              {
                parsed: {
                  info: {
                    amount: '25009340',
                    authority: 'AaZkwhkiDStDcgrU37XAj9fpNLrD8Erz5PNkdm4k5hjy',
                    destination: 'BfJjcYwnm8JmYg1AxquTHqtc35DJFt3swfQKEGbGj3CU',
                    source: 'Gjufi2NCUkgEoGgkJmjmASQgsxPhJQSD4CNrK2bst4J6',
                  },
                  type: 'transfer',
                },
                program: 'spl-token',
                programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
              },
              {
                accounts: [],
                data: '3hd3odyyp3J7',
                programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
              },
            ],
            recentBlockhash: 'G8DWwpPqnN4boETeGiebkswqtGhw3xp6QtDSsehL4fVW',
          },
          signatures: ['fakeTokenSignature'],
        },
      }
    }

    return null
  }
}

const mockPackage = {
  ...realPackage,
  Connection,
}

module.exports = mockPackage
