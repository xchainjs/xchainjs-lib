import { Network } from '@xchainjs/xchain-client'
import { baseToAsset } from '@xchainjs/xchain-util'

import { Client, defaultXMRParams, scanBlocks, computeBalance } from '../src'
import { deriveKeyPairs } from '../src/crypto/keys'
import { bytesToHex, scReduce32 } from '../src/utils'
import { getSeed } from '@xchainjs/xchain-crypto'
import slip10 from 'micro-key-producer/slip10.js'

// Set PHRASE env var or hardcode for local testing
const PHRASE = process.env.PHRASE_MAINNET || process.env.PHRASE || ''

jest.setTimeout(300000)

// Known test transaction
const KNOWN_TX = '1c3721c01a8d0a3f2a9b075dfddab317919cfc89340684048cd5b96c19fb0157'
const KNOWN_TX_BLOCK = 3626766
const DAEMON_URL = 'https://xmr-node.cakewallet.com:18081'

describe('Monero Client E2E', () => {
  let client: Client

  beforeAll(() => {
    if (!PHRASE) throw new Error('Set PHRASE_MAINNET or PHRASE env var')
    client = new Client({
      ...defaultXMRParams,
      network: Network.Mainnet,
      phrase: PHRASE,
      restoreHeight: KNOWN_TX_BLOCK,
    })
  })

  describe('Address', () => {
    it('should derive a valid mainnet address', async () => {
      const address = await client.getAddressAsync(0)
      console.log('Address:', address)
      expect(address).toBeTruthy()
      expect(address.startsWith('4')).toBe(true)
      expect(address.length).toBe(95)
    })

    it('should validate own address', async () => {
      const address = await client.getAddressAsync(0)
      expect(client.validateAddress(address)).toBe(true)
    })

    it('should reject invalid address', () => {
      expect(client.validateAddress('notanaddress')).toBe(false)
    })

    it('should derive different addresses for different indices', async () => {
      const addr0 = await client.getAddressAsync(0)
      const addr1 = await client.getAddressAsync(1)
      expect(addr0).not.toBe(addr1)
    })
  })

  describe('Explorer URLs', () => {
    it('should return explorer URL', () => {
      expect(client.getExplorerUrl()).toContain('xmrchain.net')
    })

    it('should return explorer tx URL', () => {
      expect(client.getExplorerTxUrl(KNOWN_TX)).toContain(KNOWN_TX)
    })
  })

  describe('Fees', () => {
    it('should get fee estimate from daemon', async () => {
      const fees = await client.getFees()
      console.log('Fees:', {
        average: fees.average.amount().toString(),
        fast: fees.fast.amount().toString(),
        fastest: fees.fastest.amount().toString(),
      })
      expect(fees.average.amount().gt(0)).toBe(true)
    })
  })

  describe('Transaction Data', () => {
    it('should get transaction data by hash', async () => {
      const tx = await client.getTransactionData(KNOWN_TX)
      console.log('Transaction:', { hash: tx.hash, date: tx.date.toISOString() })
      expect(tx.hash).toBe(KNOWN_TX)
      expect(tx.date).toBeInstanceOf(Date)
      expect(tx.asset.chain).toBe('XMR')
    })
  })

  describe('Scanner (targeted range)', () => {
    it('should find owned outputs in a known block range', async () => {
      // Derive keys from phrase
      const seed = getSeed(PHRASE)
      const hd = slip10.fromMasterSeed(seed)
      const derived = hd.derive("m/44'/128'/0'")
      const privSpendKey = scReduce32(derived.privateKey)
      const keys = deriveKeyPairs(privSpendKey)

      console.log('pubViewKey:', bytesToHex(keys.publicViewKey))
      console.log('pubSpendKey:', bytesToHex(keys.publicSpendKey))

      // Scan only a small range around the known tx
      const result = await scanBlocks(
        DAEMON_URL,
        keys.privateViewKey,
        keys.publicSpendKey,
        privSpendKey,
        KNOWN_TX_BLOCK - 2,
        KNOWN_TX_BLOCK + 2,
      )

      console.log(`Found ${result.ownedOutputs.length} owned outputs`)
      console.log(`Found ${result.spentKeyImages.size} key images`)

      for (const out of result.ownedOutputs) {
        console.log(
          `  tx=${out.txHash.substring(0, 16)}... output=${out.outputIndex} amount=${
            Number(out.amount) / 1e12
          } XMR height=${out.height}`,
        )
      }

      expect(result.ownedOutputs.length).toBeGreaterThan(0)

      const balance = computeBalance(result.ownedOutputs, result.spentKeyImages)
      console.log(`Balance from scan: ${Number(balance) / 1e12} XMR`)
      expect(balance).toBe(BigInt(1000000000)) // 0.001 XMR
    })
  })

  describe('Balance via client', () => {
    // This test scans from restoreHeight to current tip — slow with many blocks.
    // Skip by default; run manually with: --testNamePattern="Balance via client"
    it.skip('should get balance via daemon scanning (slow - scans to chain tip)', async () => {
      // Use a fresh client with tight restore height to avoid scanning the full chain
      const tightClient = new Client({
        ...defaultXMRParams,
        network: Network.Mainnet,
        phrase: PHRASE,
        restoreHeight: KNOWN_TX_BLOCK - 2,
      })

      const address = await tightClient.getAddressAsync(0)
      console.log('Fetching balance for:', address)

      const balances = await tightClient.getBalance(address)
      console.log(
        'Balances:',
        balances.map((b) => ({
          asset: `${b.asset.chain}.${b.asset.symbol}`,
          amount: baseToAsset(b.amount).amount().toString(),
        })),
      )

      expect(balances.length).toBe(1)
      expect(balances[0].asset.chain).toBe('XMR')
      expect(balances[0].amount.amount().gt(0)).toBe(true)
      console.log(`Balance: ${baseToAsset(balances[0].amount).amount().toFixed(12)} XMR`)
    })
  })
})
