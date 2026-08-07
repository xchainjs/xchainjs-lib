import { describe, it, expect } from 'vitest'
import { Network } from '@xchainjs/xchain-client'
import {
  withAccountIndex,
  normalizeBtcRootPath,
  applyDerivationOverrides,
  previewRootPath,
} from './paths'

describe('derivation path helpers', () => {
  it('rewrites the BIP account slot', () => {
    expect(withAccountIndex("m/84'/0'/0'/0/", 5)).toBe("m/84'/0'/5'/0/")
    expect(withAccountIndex("m/44'/60'/0'/0/", 2)).toBe("m/44'/60'/2'/0/")
    expect(withAccountIndex("m/49'/0'/0'/0/", 1)).toBe("m/49'/0'/1'/0/")
  })

  it('leaves {index} templates unchanged', () => {
    expect(withAccountIndex("m/44'/60'/{index}'/0/0", 3)).toBe("m/44'/60'/{index}'/0/0")
  })

  it('normalizes BTC trailing slash', () => {
    expect(normalizeBtcRootPath("m/84'/0'/0'/0")).toBe("m/84'/0'/0'/0/")
    expect(normalizeBtcRootPath("m/84'/0'/0'/0/")).toBe("m/84'/0'/0'/0/")
  })

  it('applies custom root to all networks', () => {
    const roots = {
      [Network.Mainnet]: "m/84'/0'/0'/0/",
      [Network.Testnet]: "m/84'/1'/0'/0/",
      [Network.Stagenet]: "m/84'/0'/0'/0/",
    }
    const next = applyDerivationOverrides(roots, { customRootPath: "m/84'/0'/7'/0" }, 'btc')
    expect(next?.[Network.Mainnet]).toBe("m/84'/0'/7'/0/")
    expect(next?.[Network.Testnet]).toBe("m/84'/0'/7'/0/")
  })

  it('previews effective path with account index', () => {
    expect(previewRootPath("m/86'/0'/0'/0/", { accountIndex: 4 }, 'btc')).toBe("m/86'/0'/4'/0/")
  })
})
