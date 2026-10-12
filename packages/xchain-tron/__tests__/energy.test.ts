import { applyDynamicEnergy, TRC20_TRANSFER_ENERGY, TRC20_TRANSFER_ENERGY_EMPTY } from '../src/const'

describe('applyDynamicEnergy', () => {
  it('leaves the base energy unchanged when the contract has no penalty', () => {
    expect(applyDynamicEnergy(TRC20_TRANSFER_ENERGY, 0)).toEqual(TRC20_TRANSFER_ENERGY)
  })

  it('floors a fractional penalty the way the fee-limit formula does', () => {
    // floor(3 * (10000 + 1) / 10000) = 3. Ceil would be 4.
    expect(applyDynamicEnergy(3, 1)).toEqual(3)
  })

  it('scales an SSTORE by the USDT energy factor of 3.4', () => {
    // The failed USDT transfer died on SSTORE: base 5,000 plus penalty 17,000.
    expect(applyDynamicEnergy(5_000, 34_000)).toEqual(22_000)
  })

  it('prices a transfer to an existing holder near the measured 64,285 energy', () => {
    const energy = applyDynamicEnergy(TRC20_TRANSFER_ENERGY, 34_000)
    expect(energy).toBeGreaterThanOrEqual(64_285)
    expect(energy).toBeLessThan(65_000)
  })

  it('prices a transfer to an empty balance slot near the measured 130,285 energy', () => {
    const energy = applyDynamicEnergy(TRC20_TRANSFER_ENERGY_EMPTY, 34_000)
    expect(energy).toBeGreaterThanOrEqual(130_285)
    expect(energy).toBeLessThan(131_000)
  })
})
