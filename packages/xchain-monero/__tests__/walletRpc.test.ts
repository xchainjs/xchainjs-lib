import * as walletRpc from '../src/walletRpc'

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('wallet RPC client', () => {
  const url = 'http://127.0.0.1:18088'

  it('Should ping get_version', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { version: 65536 } }),
    })

    await expect(walletRpc.getVersion(url)).resolves.toBe(65536)
    expect(mockFetch).toHaveBeenCalledWith(
      `${url}/json_rpc`,
      expect.objectContaining({ method: 'POST', signal: expect.any(AbortSignal) }),
    )
  })

  it('Should time out when the AbortSignal fires', async () => {
    jest.useFakeTimers()
    try {
      mockFetch.mockImplementationOnce((_input: RequestInfo | URL, init?: RequestInit) => {
        return new Promise((_, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => {
              const err = new Error('aborted')
              err.name = 'AbortError'
              reject(err)
            },
            { once: true },
          )
        })
      })

      // Attach the rejection matcher before the timer fires so the abort is not unhandled.
      const assertion = expect(walletRpc.getVersion(url)).rejects.toThrow(
        /Wallet RPC timeout after 30000ms calling get_version/,
      )
      await jest.advanceTimersByTimeAsync(30_000)
      await assertion
    } finally {
      jest.useRealTimers()
    }
  })

  it('Should parse get_balance integers as strings', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { balance: 1000000000000, unlocked_balance: 500000000000 } }),
    })

    const result = await walletRpc.getBalance(url)
    expect(result.balance).toBe('1000000000000')
    expect(result.unlockedBalance).toBe('500000000000')
  })

  it('Should throw WalletRpcError on RPC error payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: { code: -13, message: 'No wallet file' } }),
    })

    await expect(walletRpc.getAddress(url)).rejects.toThrow('No wallet file')
  })

  it('Should create a wallet when none is open', async () => {
    let created = false
    mockFetch.mockImplementation(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const rawBody = typeof init?.body === 'string' ? init.body : '{}'
      const body = JSON.parse(rawBody) as { method?: string }
      switch (body.method) {
        case 'get_version':
          return { ok: true, json: async () => ({ result: { version: 1 } }) }
        case 'get_address':
          if (!created) {
            return { ok: true, json: async () => ({ error: { code: -13, message: 'No wallet file' } }) }
          }
          return { ok: true, json: async () => ({ result: { address: '4abc' } }) }
        case 'open_wallet':
          return { ok: true, json: async () => ({ error: { code: -1, message: 'Failed to open wallet' } }) }
        case 'generate_from_keys':
          created = true
          return { ok: true, json: async () => ({ result: { address: '4abc', info: 'ok' } }) }
        default:
          return { ok: false, status: 500, statusText: body.method }
      }
    })

    await walletRpc.ensureWallet(url, {
      filename: 'xchain-test',
      address: '4abc',
      spendKey: 'aa'.repeat(32),
      viewKey: 'bb'.repeat(32),
      password: 'secret',
      restoreHeight: 3626700,
    })

    const methods = mockFetch.mock.calls.map((call) => {
      const raw = call[1]?.body
      return JSON.parse(typeof raw === 'string' ? raw : '{}').method
    })
    expect(methods).toContain('generate_from_keys')
  })

  it('Should flatten in/out transfers and drop height-0 entries', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: {
          in: [
            { txid: 'aaa', timestamp: 1, height: 10, amount: 1, type: 'in' },
            { txid: 'unconfirmed', timestamp: 4, height: 0, amount: 4, type: 'in' },
          ],
          out: [{ txid: 'bbb', timestamp: 2, height: 11, amount: 2, type: 'out' }],
        },
      }),
    })

    const transfers = await walletRpc.getTransfers(url)
    expect(transfers.map((tx) => tx.txid)).toEqual(['aaa', 'bbb'])
    expect(transfers[1].amount).toBe('2')

    const body = JSON.parse(String(mockFetch.mock.calls[0][1]?.body)) as {
      params: { in?: boolean; out?: boolean; block?: boolean }
    }
    expect(body.params.block).toBeUndefined()
    expect(body.params.in).toBe(true)
    expect(body.params.out).toBe(true)
  })

  it('Should send transfer destinations in piconero', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { tx_hash: 'abcd'.repeat(16) } }),
    })

    const dest = '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR'
    const hash = await walletRpc.transfer(url, { address: dest, amountPiconero: '1000000000000' })
    expect(hash).toBe('abcd'.repeat(16))

    const body = JSON.parse(String(mockFetch.mock.calls[0][1]?.body)) as {
      method: string
      params: { destinations: { amount: number; address: string }[]; priority: number }
    }
    expect(body.method).toBe('transfer')
    expect(body.params.destinations).toEqual([{ amount: 1000000000000, address: dest }])
    expect(body.params.priority).toBe(2)
  })

  it('Should pass through custom transfer priority', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { tx_hash: 'abcd'.repeat(16) } }),
    })

    const dest = '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR'
    await walletRpc.transfer(url, { address: dest, amountPiconero: '1', priority: 4 })

    const body = JSON.parse(String(mockFetch.mock.calls[0][1]?.body)) as {
      params: { priority: number }
    }
    expect(body.params.priority).toBe(4)
  })

  it('Should reject amounts above JSON integer precision', async () => {
    const dest = '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR'
    const tooLarge = (BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1)).toString()
    await expect(walletRpc.transfer(url, { address: dest, amountPiconero: tooLarge })).rejects.toThrow(
      /exceeds wallet-rpc JSON integer precision/,
    )
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
