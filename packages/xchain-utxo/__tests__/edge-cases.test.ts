import { Network } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'

import { UtxoError, UtxoErrorCode } from '../src/errors'
import { UtxoTransactionValidator } from '../src/validators'
import { UtxoSelector, UtxoSelectionPreferences } from '../src/utxo-selector'
import { UTXO } from '../src/types'

describe('UTXO Edge Cases', () => {
  describe('Error System', () => {
    it('should create and identify UTXO errors correctly', () => {
      const error = UtxoError.insufficientBalance('100000', '50000', 'BTC')

      expect(error.code).toBe(UtxoErrorCode.INSUFFICIENT_BALANCE)
      expect(error.message).toContain('Insufficient balance')
      expect(error.details?.required).toBe('100000')
      expect(error.details?.available).toBe('50000')
      expect(error.details?.chain).toBe('BTC')
      expect(UtxoError.isUtxoError(error)).toBe(true)
    })

    it('should convert unknown errors to typed errors', () => {
      const genericError = new Error('Network timeout')
      const utxoError = UtxoError.fromUnknown(genericError, 'transfer')

      expect(UtxoError.isUtxoError(utxoError)).toBe(true)
      expect(utxoError.code).toBe(UtxoErrorCode.NETWORK_ERROR)
      expect(utxoError.message).toContain('transfer')
    })

    it('should provide user-friendly error messages', () => {
      const error = UtxoError.invalidAddress('invalid-addr', 'mainnet')
      const friendlyMessage = error.getUserFriendlyMessage()

      expect(friendlyMessage).toContain('address is not valid')
      expect(friendlyMessage).not.toContain('invalid-addr') // Shouldn't leak internal details
    })

    it('should serialize errors to JSON for logging', () => {
      const error = UtxoError.invalidFeeRate(0, 'Too low')
      const json = error.toJSON()

      expect(json.name).toBe('UtxoError')
      expect(json.code).toBe(UtxoErrorCode.INVALID_FEE_RATE)
      expect(json.message).toContain('Invalid fee rate')
      expect(json.details?.feeRate).toBe(0)
    })
  })

  describe('Input Validation Edge Cases', () => {
    describe('Transfer Parameters Validation', () => {
      it('should reject empty recipient address', () => {
        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: '',
            amount: baseAmount(100000, 8),
          })
        }).toThrow(UtxoError)
      })

      it('should reject extremely long recipient address', () => {
        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: 'x'.repeat(101),
            amount: baseAmount(100000, 8),
          })
        }).toThrow(UtxoError)
      })

      it('should reject zero or negative amounts', () => {
        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: baseAmount(0, 8),
          })
        }).toThrow(UtxoError)
      })

      it('should reject dust amounts', () => {
        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: baseAmount(545, 8), // Below 546 satoshi dust threshold
          })
        }).toThrow(UtxoError)
      })

      it('should reject unreasonably large amounts', () => {
        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: baseAmount('2200000000000000', 8), // > 21M BTC
          })
        }).toThrow(UtxoError)
      })

      it('should reject invalid fee rates', () => {
        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: baseAmount(100000, 8),
            feeRate: 0,
          })
        }).toThrow(UtxoError)

        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: baseAmount(100000, 8),
            feeRate: 1000001, // Too high
          })
        }).toThrow(UtxoError)

        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: baseAmount(100000, 8),
            feeRate: Infinity,
          })
        }).toThrow(UtxoError)
      })

      it('should reject memos with control characters', () => {
        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: baseAmount(100000, 8),
            memo: 'Test\x00memo', // Contains null byte
          })
        }).toThrow(UtxoError)

        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: baseAmount(100000, 8),
            memo: 'Test\x01memo', // Contains control character
          })
        }).toThrow(UtxoError)
      })

      it('should reject overly long memos', () => {
        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: baseAmount(100000, 8),
            memo: 'x'.repeat(81), // > 80 bytes
          })
        }).toThrow(UtxoError)
      })

      it('should reject invalid wallet indexes', () => {
        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: baseAmount(100000, 8),
            walletIndex: -1,
          })
        }).toThrow(UtxoError)

        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: baseAmount(100000, 8),
            walletIndex: 2147483648, // > BIP32 limit
          })
        }).toThrow(UtxoError)

        expect(() => {
          UtxoTransactionValidator.validateTransferParams({
            recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: baseAmount(100000, 8),
            walletIndex: 1.5, // Non-integer
          })
        }).toThrow(UtxoError)
      })
    })

    describe('UTXO Set Validation', () => {
      it('should reject non-array UTXO sets', () => {
        expect(() => {
          UtxoTransactionValidator.validateUtxoSet(null as any)
        }).toThrow(UtxoError)

        expect(() => {
          UtxoTransactionValidator.validateUtxoSet('not an array' as any)
        }).toThrow(UtxoError)
      })

      it('should reject UTXOs with invalid transaction hashes', () => {
        const invalidUtxos = [
          { hash: '', index: 0, value: 100000 }, // Empty hash
          { hash: 'too-short', index: 0, value: 100000 }, // Too short
          { hash: 'x'.repeat(63), index: 0, value: 100000 }, // Too short by 1
          { hash: 'x'.repeat(65), index: 0, value: 100000 }, // Too long by 1
          { hash: 'gggggggg' + 'f'.repeat(56), index: 0, value: 100000 }, // Invalid hex
        ]

        invalidUtxos.forEach((utxo) => {
          expect(() => {
            UtxoTransactionValidator.validateUtxoSet([utxo as UTXO])
          }).toThrow(UtxoError)
        })
      })

      it('should reject UTXOs with invalid output indexes', () => {
        const validHash = 'f'.repeat(64)
        const invalidUtxos = [
          { hash: validHash, index: -1, value: 100000 }, // Negative
          { hash: validHash, index: 4294967296, value: 100000 }, // > uint32 max
          { hash: validHash, index: 1.5, value: 100000 }, // Non-integer
          { hash: validHash, value: 100000 }, // Missing index
        ]

        invalidUtxos.forEach((utxo) => {
          expect(() => {
            UtxoTransactionValidator.validateUtxoSet([utxo as UTXO])
          }).toThrow(UtxoError)
        })
      })

      it('should reject UTXOs with invalid values', () => {
        const validHash = 'f'.repeat(64)
        const invalidUtxos = [
          { hash: validHash, index: 0, value: 0 }, // Zero value
          { hash: validHash, index: 0, value: -1000 }, // Negative value
          { hash: validHash, index: 0, value: 2100000000000001 }, // > 21M BTC
          { hash: validHash, index: 0, value: 1.5 }, // Non-integer
          { hash: validHash, index: 0 }, // Missing value
        ]

        invalidUtxos.forEach((utxo) => {
          expect(() => {
            UtxoTransactionValidator.validateUtxoSet([utxo as UTXO])
          }).toThrow(UtxoError)
        })
      })

      it('should detect duplicate UTXOs', () => {
        const validHash = 'f'.repeat(64)
        const duplicateUtxos = [
          { hash: validHash, index: 0, value: 100000 },
          { hash: validHash, index: 0, value: 200000 }, // Same outpoint, different value
        ]

        expect(() => {
          UtxoTransactionValidator.validateUtxoSet(duplicateUtxos)
        }).toThrow(UtxoError)
      })

      it('should validate witness UTXO data', () => {
        const validHash = 'f'.repeat(64)
        const invalidUtxo = {
          hash: validHash,
          index: 0,
          value: 100000,
          witnessUtxo: {
            script: 'not a buffer' as any,
            value: 100000,
          },
        }

        expect(() => {
          UtxoTransactionValidator.validateUtxoSet([invalidUtxo])
        }).toThrow(UtxoError)
      })
    })

    describe('Address Format Validation', () => {
      it('should validate Bitcoin mainnet addresses correctly', () => {
        const validAddresses = [
          'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // P2WPKH
          'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297', // P2TR
          '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Legacy P2PKH
          '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', // Legacy P2SH
        ]

        validAddresses.forEach((address) => {
          expect(() => {
            UtxoTransactionValidator.validateAddressFormat(address, Network.Mainnet, 'BTC')
          }).not.toThrow()
        })
      })

      it('should validate Bitcoin testnet addresses correctly', () => {
        const validAddresses = [
          'tb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // P2WPKH testnet
          'tb1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297', // P2TR testnet
          'mjSk1Ny9spzU2fouzYgLqGUD8U41iR35QN', // Legacy testnet
        ]

        validAddresses.forEach((address) => {
          expect(() => {
            UtxoTransactionValidator.validateAddressFormat(address, Network.Testnet, 'BTC')
          }).not.toThrow()
        })
      })

      it('should reject cross-network addresses', () => {
        expect(() => {
          UtxoTransactionValidator.validateAddressFormat(
            'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // mainnet
            Network.Testnet,
            'BTC',
          )
        }).toThrow(UtxoError)

        expect(() => {
          UtxoTransactionValidator.validateAddressFormat(
            'tb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // testnet
            Network.Mainnet,
            'BTC',
          )
        }).toThrow(UtxoError)
      })

      it('should validate Litecoin addresses', () => {
        const validMainnetAddresses = [
          'LTC7k1pvpDbwGaWd9TApVVCt2zMEDQcj2', // Legacy
          'ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Bech32
        ]

        validMainnetAddresses.forEach((address) => {
          expect(() => {
            UtxoTransactionValidator.validateAddressFormat(address, Network.Mainnet, 'LTC')
          }).not.toThrow()
        })
      })

      it('should validate Dogecoin addresses', () => {
        const validAddress = 'DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L'

        expect(() => {
          UtxoTransactionValidator.validateAddressFormat(validAddress, Network.Mainnet, 'DOGE')
        }).not.toThrow()

        // Should reject Bitcoin address for Dogecoin
        expect(() => {
          UtxoTransactionValidator.validateAddressFormat(
            'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            Network.Mainnet,
            'DOGE',
          )
        }).toThrow(UtxoError)
      })
    })
  })

  describe('UTXO Selection Edge Cases', () => {
    let selector: UtxoSelector

    beforeEach(() => {
      selector = new UtxoSelector()
    })

    describe('Branch and Bound Strategy', () => {
      it('should find exact matches when possible', () => {
        const utxos: UTXO[] = [
          { hash: 'hash1', index: 0, value: 100000 },
          { hash: 'hash2', index: 0, value: 50690 }, // Perfect for 50000 + fee
          { hash: 'hash3', index: 0, value: 200000 },
        ]

        const result = selector.selectOptimal(utxos, 50000, 10, { minimizeFee: true })

        expect(result.inputs).toHaveLength(1)
        expect(result.inputs[0].value).toBe(50690)
        expect(result.changeAmount).toBe(0) // No change needed
        expect(result.strategy).toBe('BranchAndBound')
      })

      it('should minimize change when possible', () => {
        const utxos: UTXO[] = [
          { hash: 'hash1', index: 0, value: 51000 }, // Would leave ~320 change
          { hash: 'hash2', index: 0, value: 50700 }, // Would leave ~20 change (better)
          { hash: 'hash3', index: 0, value: 100000 },
        ]

        const result = selector.selectOptimal(utxos, 50000, 10, { minimizeChange: true })

        expect(result.changeAmount).toBeLessThan(1000) // Minimal change
      })

      it('should handle dust UTXOs appropriately', () => {
        const utxos: UTXO[] = [
          { hash: 'hash1', index: 0, value: 546 }, // Exactly dust threshold
          { hash: 'hash2', index: 0, value: 545 }, // Below dust threshold
          { hash: 'hash3', index: 0, value: 100000 },
        ]

        // Without avoiding dust
        const result1 = selector.selectOptimal(utxos, 50000, 10)
        expect(result1.inputs.some((input) => input.value === 546)).toBe(true) // Can use dust threshold

        // With avoiding dust
        const result2 = selector.selectOptimal(utxos, 50000, 10, { avoidDust: true })
        expect(result2.inputs.every((input) => input.value > 546)).toBe(true) // Avoids dust
      })
    })

    describe('Error Handling', () => {
      it('should throw error when no UTXOs available', () => {
        expect(() => {
          selector.selectOptimal([], 50000, 10)
        }).toThrow(UtxoError)
      })

      it('should throw error when insufficient balance', () => {
        const utxos: UTXO[] = [
          { hash: 'hash1', index: 0, value: 30000 },
          { hash: 'hash2', index: 0, value: 10000 },
        ]

        expect(() => {
          selector.selectOptimal(utxos, 50000, 10)
        }).toThrow(UtxoError)
      })

      it('should handle invalid target values', () => {
        const utxos: UTXO[] = [{ hash: 'hash1', index: 0, value: 100000 }]

        expect(() => {
          selector.selectOptimal(utxos, 0, 10)
        }).toThrow(UtxoError)

        expect(() => {
          selector.selectOptimal(utxos, -1000, 10)
        }).toThrow(UtxoError)
      })

      it('should handle invalid fee rates', () => {
        const utxos: UTXO[] = [{ hash: 'hash1', index: 0, value: 100000 }]

        expect(() => {
          selector.selectOptimal(utxos, 50000, 0)
        }).toThrow(UtxoError)

        expect(() => {
          selector.selectOptimal(utxos, 50000, -10)
        }).toThrow(UtxoError)
      })
    })

    describe('Large UTXO Sets', () => {
      it('should handle large UTXO sets efficiently', () => {
        const largeUtxoSet: UTXO[] = Array.from({ length: 1000 }, (_, i) => ({
          hash: `hash${i}`,
          index: 0,
          value: 1000 + i,
        }))

        const startTime = Date.now()
        const result = selector.selectOptimal(largeUtxoSet, 5000, 10)
        const endTime = Date.now()

        expect(result.inputs.length).toBeGreaterThan(0)
        expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
      })

      it('should prevent excessive computation', () => {
        // Create a pathological case that could cause exponential time
        const pathologicalUtxos: UTXO[] = Array.from({ length: 100 }, (_, i) => ({
          hash: `hash${i}`,
          index: 0,
          value: 1000,
        }))

        const startTime = Date.now()
        const result = selector.selectOptimal(pathologicalUtxos, 90000, 1) // Requires 90 UTXOs
        const endTime = Date.now()

        expect(result.inputs.length).toBeLessThanOrEqual(100)
        expect(endTime - startTime).toBeLessThan(5000) // Should not take more than 5 seconds
      })
    })

    describe('Fee Rate Edge Cases', () => {
      it('should handle very low fee rates', () => {
        const utxos: UTXO[] = [{ hash: 'hash1', index: 0, value: 100000 }]

        const result = selector.selectOptimal(utxos, 50000, 1) // 1 sat/byte

        expect(result.fee).toBeGreaterThan(0)
        expect(result.inputs[0].value).toBeGreaterThanOrEqual(result.fee + 50000)
      })

      it('should handle very high fee rates', () => {
        const utxos: UTXO[] = [{ hash: 'hash1', index: 0, value: 1000000 }] // 0.01 BTC

        const result = selector.selectOptimal(utxos, 50000, 1000) // 1000 sat/byte

        expect(result.fee).toBeGreaterThan(50000) // Fee higher than amount
        expect(result.inputs[0].value).toBeGreaterThanOrEqual(result.fee + 50000)
      })
    })

    describe('Selection Strategy Preferences', () => {
      it('should prioritize fewer inputs when requested', () => {
        const utxos: UTXO[] = [
          { hash: 'hash1', index: 0, value: 100000 }, // Single input solution
          { hash: 'hash2', index: 0, value: 30000 },
          { hash: 'hash3', index: 0, value: 30000 },
          { hash: 'hash4', index: 0, value: 30000 }, // Multi-input solution
        ]

        const result = selector.selectOptimal(utxos, 50000, 10, { minimizeInputs: true })

        expect(result.inputs).toHaveLength(1)
        expect(result.inputs[0].value).toBe(100000)
      })

      it('should consolidate small UTXOs when requested', () => {
        const utxos: UTXO[] = [
          { hash: 'hash1', index: 0, value: 100000 }, // Large UTXO
          { hash: 'hash2', index: 0, value: 5000 }, // Small UTXOs
          { hash: 'hash3', index: 0, value: 5000 },
          { hash: 'hash4', index: 0, value: 5000 },
          { hash: 'hash5', index: 0, value: 5000 },
        ]

        const result = selector.selectOptimal(utxos, 15000, 10, { consolidateSmallUtxos: true })

        const smallUtxoCount = result.inputs.filter((utxo) => utxo.value < 10000).length
        expect(smallUtxoCount).toBeGreaterThan(2) // Should use multiple small UTXOs
      })
    })
  })

  describe('Memory and Performance Edge Cases', () => {
    it('should handle concurrent operations without memory leaks', async () => {
      const utxos: UTXO[] = Array.from({ length: 100 }, (_, i) => ({
        hash: `hash${i}`,
        index: 0,
        value: 10000 + i,
      }))

      const selector = new UtxoSelector()
      const initialMemory = process.memoryUsage().heapUsed

      // Run multiple concurrent selections
      const promises = Array.from({ length: 50 }, (_, i) =>
        Promise.resolve(selector.selectOptimal(utxos, 5000 + i * 100, 10 + i)),
      )

      const results = await Promise.all(promises)

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      expect(results).toHaveLength(50)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // Less than 10MB increase
    })

    it('should validate inputs efficiently for large parameter sets', () => {
      const largeUtxoSet: UTXO[] = Array.from({ length: 10000 }, (_, i) => ({
        hash: 'f'.repeat(64),
        index: i,
        value: 1000 + i,
      }))

      const startTime = Date.now()

      expect(() => {
        UtxoTransactionValidator.validateUtxoSet(largeUtxoSet)
      }).not.toThrow()

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })
  })

  describe('Network-Specific Edge Cases', () => {
    it('should handle network-specific constraints', () => {
      // Test Bitcoin-specific validation
      expect(() => {
        UtxoTransactionValidator.validateAddressFormat(
          'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          Network.Mainnet,
          'BTC',
          ['segwitV0'], // Only allow SegWit v0
        )
      }).not.toThrow()

      expect(() => {
        UtxoTransactionValidator.validateAddressFormat(
          '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Legacy address
          Network.Mainnet,
          'BTC',
          ['segwitV0'], // Only allow SegWit v0
        )
      }).toThrow(UtxoError)
    })

    it('should handle chain-specific fee validation', () => {
      // Bitcoin typically allows very low fees
      expect(() => {
        UtxoTransactionValidator.validateFeeRate(1, {
          minFeeRate: 1,
          maxFeeRate: 1000,
          recommendedRange: [5, 50],
        })
      }).not.toThrow()

      // Some chains might have higher minimum fees
      expect(() => {
        UtxoTransactionValidator.validateFeeRate(1, {
          minFeeRate: 10,
          maxFeeRate: 1000,
        })
      }).toThrow(UtxoError)
    })
  })

  describe('Transaction Size Edge Cases', () => {
    it('should reject transactions that exceed size limits', () => {
      expect(() => {
        UtxoTransactionValidator.validateTransactionSize(100001, 100000)
      }).toThrow(UtxoError)
    })

    it('should warn for large but valid transactions', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      expect(() => {
        UtxoTransactionValidator.validateTransactionSize(85000, 100000) // 85% of limit
      }).not.toThrow()

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('approaching limit'))

      consoleSpy.mockRestore()
    })
  })
})
