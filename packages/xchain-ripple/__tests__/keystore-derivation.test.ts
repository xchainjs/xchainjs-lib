import { Network } from '@xchainjs/xchain-client'

import { defaultXRPParams } from '../src/client'
import { ClientKeystore } from '../src/clientKeystore'

const PHRASE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

describe('ClientKeystore mnemonic derivation', () => {
  const client = new ClientKeystore({
    ...defaultXRPParams,
    network: Network.Mainnet,
    phrase: PHRASE,
  })

  it('keeps the secp256k1 address for the default account', () => {
    const wallet = client.getXrplWallet(0)
    expect(wallet.address).toBe('rHsMGQEkVNJmpGWs8XUBoTBiAAbwxZN5v3')
    expect(wallet.publicKey.toUpperCase()).toBe('031D68BC1A142E6766B2BDFB006CCFE135EF2E0E2E94ABB5CF5C9AB6104776FBAE')
    expect(client.getAddress(0)).toBe('rHsMGQEkVNJmpGWs8XUBoTBiAAbwxZN5v3')
  })

  it('keeps the secp256k1 address for wallet index 1', () => {
    expect(client.getAddress(1)).toBe('r3AgF9mMBFtaLhKcg96weMhbbEFLZ3mx17')
  })
})
