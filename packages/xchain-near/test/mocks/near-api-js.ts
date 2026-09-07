/** Manual Jest mock — near-api-js pulls ESM @noble builds that Jest cannot load. */

export class JsonRpcProvider {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  constructor(_connectionInfo?: unknown, _options?: unknown) {}
  viewAccount = jest.fn()
  viewGasPrice = jest.fn()
  viewTransactionStatus = jest.fn()
  sendTransaction = jest.fn()
  callFunction = jest.fn()
}

export class FailoverRpcProvider {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  constructor(_providers: unknown[]) {}
  viewAccount = jest.fn()
  viewGasPrice = jest.fn()
  viewTransactionStatus = jest.fn()
  sendTransaction = jest.fn()
  callFunction = jest.fn()
}

export class KeyPairEd25519 {
  constructor(public extendedSecretKey: string) {}
  getPublicKey() {
    return {
      data: new Uint8Array(32),
      toString: () => `ed25519:${this.extendedSecretKey}`,
    }
  }
}

export const KeyPair = {
  fromString: (s: string) => new KeyPairEd25519(s.replace(/^ed25519:/, '')),
  fromRandom: () => new KeyPairEd25519('mock'),
}

export class KeyPairSigner {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  constructor(_key: unknown) {}
}

export class Account {
  // Shared mocks so tests can configure behavior without capturing instances.
  static transfer = jest.fn()
  static createTransaction = jest.fn()
  static createSignedTransaction = jest.fn()
  static callFunction = jest.fn()

  transfer = Account.transfer
  createTransaction = Account.createTransaction
  createSignedTransaction = Account.createSignedTransaction
  callFunction = Account.callFunction

  constructor(
    public accountId: string,
    public provider: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _signer?: unknown,
  ) {}
}

export const actions = {
  transfer: (deposit: bigint) => ({ transfer: { deposit } }),
  functionCall: (methodName: string, args: unknown, gas?: bigint, deposit?: bigint) => ({
    functionCall: { methodName, args, gas, deposit },
  }),
}

export const baseEncode = (value: Uint8Array | string): string =>
  Buffer.from(typeof value === 'string' ? value : value).toString('base64')

export const base64Encode = (bytes: Uint8Array): string => Buffer.from(bytes).toString('base64')

export const decodeTransaction = jest.fn()
export const decodeSignedTransaction = jest.fn()

export class SignedTransaction {}
