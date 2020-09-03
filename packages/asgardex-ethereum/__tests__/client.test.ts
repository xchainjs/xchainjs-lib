import Client from '../src/client'
import { Network } from '../src/types'
import { ethers, Wallet, providers } from 'ethers'
import { parseEther } from "@ethersproject/units";
import { TransactionResponse, TransactionReceipt } from "@ethersproject/abstract-provider"
import { SigningKey } from 'ethers/lib/utils';

/**
 * Test Data
 * @todo import from .ts
 */
const phrase = 'canyon throw labor waste awful century ugly they found post source draft'
const newPhrase = 'logic neutral rug brain pluck submit earth exit erode august remain ready'
const address = '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E'
const vault = '0x8c2A90D36Ec9F745C9B28B588Cba5e2A978A1656'
const wallet = {
  signingKey: {
    curve: 'secp256k1',
    privateKey: '0x739172c3520ea86ad6238b4f303cc09da6ca7254c76af1a1e8fa3fb00eb5c16f',
    publicKey: '0x04ef84375983ef666afdf0e430929574510aa56fb5ee0ee8c02a73f2d2c12ff8f7eee6cdaf9ab6d14fdeebc7ff3d7890f5f98376dac0e5d816dca347bc71d2aec8',
    compressedPublicKey: '0x02ef84375983ef666afdf0e430929574510aa56fb5ee0ee8c02a73f2d2c12ff8f7',
    _isSigningKey: true
    },
}

const txResponse = {
  hash: '0x9eb9db9c3ec72918c7db73ae44e520139e95319c421ed6f9fc11fa8dd0cddc56',
  parentHash: '0x9b095b36c15eaf13044373aef8ee0bd3a382a5abb92e402afa44b8249c3a90e9',
  number: 3,
  timestamp: 1492010489,
  nonce: 1,
  difficulty: 2,
  gasLimit: ethers.BigNumber.from('0x47e7c4'),
  gasPrice: ethers.BigNumber.from('0x3b9aca00'),
  to: '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E',
  from: '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E',
  value: ethers.BigNumber.from('0x00'),
  data: '0x54455354',
  chainId: 4,
  gasUsed: ethers.BigNumber.from(0),
  miner: '0x0000000000000000000000000000000000000000',
  extraData:
    '0xd783010600846765746887676f312e372e33856c696e757800000000000000004e10f96536e45ceca7e34cc1bdda71db3f3bb029eb69afd28b57eb0202c0ec0859d383a99f63503c4df9ab6c1dc63bf6b9db77be952f47d86d2d7b208e77397301',
  transactions: [],
  confirmations: 1,
  wait: (_?: number): Promise<TransactionReceipt> => Promise.reject(new Error('no need to implement')),
}

/**
 * Wallet Tests
 */
describe('Wallets', () => {
  it('should create a new wallet', () => {
    const ethClient = new Client()

    expect(ethClient.wallet).toBeInstanceOf(Wallet)
    expect(ethClient.wallet._signingKey()).toBeInstanceOf(SigningKey)
  })

  it('should throw error on bad phrase', () => {
    expect(() => {
      new Client(undefined, 'bad bad phrase')
    }).toThrowError()
  })

  it('should create a wallet from phrase', () => {
    const ethClient = new Client(Network.TEST, phrase)
    expect(ethClient.wallet).toBeInstanceOf(Wallet)
    expect(ethClient.wallet.provider).toBeNull()
    expect(ethClient.wallet._signingKey()).toMatchObject(wallet.signingKey)
  })

  it('should set new phrase', () => {
    const ethClient = new Client()
    const newWallet = ethClient.setPhrase(newPhrase)
    expect(ethClient.wallet.mnemonic.phrase).toEqual(newPhrase)
    expect(newWallet).toBeTruthy()
  })

  it('should fail to set new phrase', () => {
    const ethClient = new Client()
    expect(() => ethClient.setPhrase('bad bad phrase')).toThrowError()
  })
})

/**
 * Connectivity Tests (networks/providers)
 */
describe('Connecting', () => {
  it('should connect to testnet', () => {
    const ethClient = new Client()
    ethClient.init()

    expect(ethClient.wallet).toBeInstanceOf(Wallet)
    expect(ethClient.wallet.provider).toBeInstanceOf(providers.FallbackProvider)
    ethClient.wallet.provider.getNetwork().then((network) => {
      expect(network.name).toEqual('rinkeby')
      expect(network.chainId).toEqual(4)
    })
  })

  it('should connect to specified network', () => {
    const ethClient = new Client(Network.MAIN, phrase)
    ethClient.init()

    expect(ethClient.wallet).toBeInstanceOf(Wallet)
    expect(ethClient.wallet.provider).toBeInstanceOf(providers.FallbackProvider)
    expect(ethClient.wallet._signingKey()).toMatchObject(wallet.signingKey)
    ethClient.wallet.provider.getNetwork().then((network) => {
      expect(network.name).toEqual('homestead')
      expect(network.chainId).toEqual(1)
    })
  })

  it('should set network', () => {
    const ethClient = new Client(Network.TEST, phrase)
    ethClient.init()
    ethClient.setNetwork(Network.TEST)

    ethClient.wallet.provider.getNetwork().then((network) => {
      expect(network.name).toEqual('rinkeby')
      expect(network.chainId).toEqual(4)
    })
  })
})

/**
 * Utils
 */
describe('Utils', () => {
  it('should generate a phrase', () => {
    const newPhrase = Client.generatePhrase()
    expect(ethers.utils.isValidMnemonic(newPhrase)).toBeTruthy()
  })

  it('should get address', () => {
    const ethClient = new Client(Network.TEST, phrase)
    expect(ethClient.getAddress()).toEqual(address)
  })

  it('should get network', () => {
    const ethClient = new Client(Network.TEST)
    expect(ethClient.network).toEqual('rinkeby')
  })

  it('should fail a bad phrase', () => {
    const badPhrase = Client.validatePhrase('bad bad bad bad bad bad')
    expect(badPhrase).toBeFalsy()
  })

  it('should pass a good phrase', () => {
    const goodPhrase = Client.validatePhrase(phrase)
    expect(goodPhrase).toBeTruthy()
  })

  it('should fail a bad address', () => {
    expect(Client.validateAddress('0xBADbadBad')).toBeFalsy()
  })

  it('should pass a good address', () => {
    const goodAddress = Client.validateAddress(address)
    expect(goodAddress).toBeTruthy()
  })
})

describe('Transactions', () => {
  it('gets tx history', async () => {
    const ethClient = new Client(Network.TEST, phrase)
    ethClient.init()

    const mockHistory = jest.spyOn(ethClient.etherscan, 'getHistory')
    mockHistory.mockImplementation(async (_): Promise<Array<TransactionResponse>> => Promise.resolve([txResponse]))

    const txResult = await ethClient.getTransactions()

    expect(mockHistory).toHaveBeenCalledWith('0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E')
    expect(txResult).toEqual([expect.objectContaining(txResponse)])
  })

  it('checks vault and vaultTx', async () => {
    const ethClient = new Client(Network.MAIN, phrase)
    ethClient.init()

    const vaultTx = ethClient.vaultTx(ethClient.getAddress(), parseEther('1'), 'SWAP')
    expect(vaultTx).rejects.toBe('vault has to be set before sending vault tx')
    ethClient.setVault(vault)
    expect(ethClient.vault).not.toBeNull()
    if (ethClient.vault != null) {
      expect(ethClient.vault.address).toEqual(vault)
    }
  })

  it('sends a normalTx', async () => {
    const ethClient = new Client(Network.MAIN, phrase)
    ethClient.init()

    const mockTx = jest.spyOn(ethClient.wallet, 'sendTransaction')
    mockTx.mockImplementation(
      async (_): Promise<TransactionResponse> => {
        return Promise.resolve(txResponse)
      },
    )

    await ethClient.normalTx(ethClient.getAddress(), parseEther('1'))
    expect(mockTx).toHaveBeenCalledWith({
      to: '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E',
      value: ethers.BigNumber.from('0x0de0b6b3a7640000'),
    })
  })
})

describe('Balances', () => {
  it('gets a balance without address args', async () => {
    const ethClient = new Client(Network.TEST, phrase)
    ethClient.init()

    const mockBalance = jest.spyOn(ethClient.wallet.provider, 'getBalance')
    mockBalance.mockImplementation(async (_): Promise<ethers.BigNumber> => Promise.resolve(parseEther('1.786')))

    const balance = await ethClient.getBalance()

    expect(mockBalance).toHaveBeenCalledWith('0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E')
    expect(ethClient.balance).toEqual('1.786')
    expect(balance).toEqual('1.786')
  })

  it('gets a balance from address', async () => {
    const ethClient = new Client(Network.TEST, phrase)
    ethClient.init()

    const mockBalance = jest.spyOn(ethClient.wallet.provider, 'getBalance')
    mockBalance.mockImplementation(async (_): Promise<ethers.BigNumber> => Promise.resolve(parseEther('0.1')))

    await ethClient.getBalance('0xb1d133e115E32Bee0F163EcD2c60FB462b8cDdC1')

    expect(mockBalance).toHaveBeenCalledWith('0xb1d133e115E32Bee0F163EcD2c60FB462b8cDdC1')
    expect(ethClient.balance).toEqual('0.1')
  })

  it('throws error on bad address', async () => {
    const ethClient = new Client(Network.TEST, phrase)
    ethClient.init()
    await expect(ethClient.getBalance('0xbad')).rejects.toThrowError()
  })
})
