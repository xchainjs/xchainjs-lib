import * as daemon from '../src/daemon'

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('daemon RPC', () => {
  it('Should parse get_output_distribution as an array, not a nested data object', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: {
          distributions: [
            {
              amount: 0,
              base: 10,
              distribution: [10, 25, 40],
              start_height: 100,
            },
          ],
          status: 'OK',
        },
      }),
    })

    const result = await daemon.getOutputDistribution('https://daemon.test')
    expect(result.distribution).toEqual([10, 25, 40])
    expect(result.startHeight).toBe(100)
    expect(result.base).toBe(10)
  })
})
