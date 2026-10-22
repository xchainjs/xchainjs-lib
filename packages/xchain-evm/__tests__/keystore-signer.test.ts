import { JsonRpcProvider, Transaction } from 'ethers'

import { KeystoreSigner } from '../src'

const phrase = 'canyon throw labor waste awful century ugly they found post source draft'
const provider = new JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')

const standardPath = `m/44'/60'/0'/0/`
const ledgerLivePath = `m/44'/60'/{index}'/0/0`

const makeSigner = (derivationPath: string) => new KeystoreSigner({ phrase, provider, derivationPath })

describe('EVM KeystoreSigner derivation paths', () => {
  describe('getFullDerivationPath', () => {
    it('appends the wallet index for standard paths', () => {
      const signer = makeSigner(standardPath)
      expect(signer.getFullDerivationPath(0)).toBe(`m/44'/60'/0'/0/0`)
      expect(signer.getFullDerivationPath(2)).toBe(`m/44'/60'/0'/0/2`)
    })

    it('substitutes the {index} placeholder for Ledger Live paths', () => {
      const signer = makeSigner(ledgerLivePath)
      expect(signer.getFullDerivationPath(0)).toBe(`m/44'/60'/0'/0/0`)
      expect(signer.getFullDerivationPath(2)).toBe(`m/44'/60'/2'/0/0`)
    })
  })

  describe('address derivation', () => {
    it('keeps the existing default-path address (regression)', () => {
      expect(makeSigner(standardPath).getAddress(0)).toBe('0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e')
    })

    it('matches the standard path at account index 0 (both resolve to m/44\'/60\'/0\'/0/0)', () => {
      expect(makeSigner(ledgerLivePath).getAddress(0)).toBe(makeSigner(standardPath).getAddress(0))
    })

    it('derives a different account from the standard path at index 1', () => {
      // Ledger Live index 1 => m/44'/60'/1'/0/0, standard index 1 => m/44'/60'/0'/0/1
      expect(makeSigner(ledgerLivePath).getAddress(1)).not.toBe(makeSigner(standardPath).getAddress(1))
    })
  })

  describe('signApprove', () => {
    const approvalTx = (): Transaction => {
      const tx = new Transaction()
      tx.to = '0x3624525075b88B24ecc29CE226b0CEc1fFcB6976'
      tx.chainId = 43114n
      tx.nonce = 1
      tx.gasLimit = 50000n
      tx.gasPrice = 1n
      tx.data = '0x095ea7b3'
      return tx
    }

    it('signs with the requested account', async () => {
      const signer = makeSigner(standardPath)
      const signed = await signer.signApprove({ walletIndex: 1, tx: approvalTx() })
      expect(Transaction.from(signed).from?.toLowerCase()).toBe(signer.getAddress(1))
    })

    it('signs account 0 when the index is 0', async () => {
      const signer = makeSigner(standardPath)
      const signed = await signer.signApprove({ walletIndex: 0, tx: approvalTx() })
      expect(Transaction.from(signed).from?.toLowerCase()).toBe(signer.getAddress(0))
    })
  })

  describe('setPhrase / purge', () => {
    it('returns the index-0 address and throws after purge', () => {
      const signer = makeSigner(ledgerLivePath)
      expect(signer.setPhrase(phrase)).toBe(signer.getAddress(0))
      signer.purge()
      expect(() => signer.getAddress(0)).toThrow()
    })
  })
})
