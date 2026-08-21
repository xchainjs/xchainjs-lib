import {
  TxNotFoundError,
  createRoundRobinExhaustedError,
  isAlreadyBroadcastError,
  isRetryableRpcError,
  roundRobinGetTx,
  roundRobinTry,
  signOnceThenRoundRobinBroadcast,
  tendermintTxHash,
} from '../src/roundRobin'

describe('isRetryableRpcError', () => {
  it('treats connection / gateway 5xx failures as retryable', () => {
    expect(isRetryableRpcError(new Error('Failed to fetch'))).toBe(true)
    expect(isRetryableRpcError(new Error('fetch failed'))).toBe(true)
    expect(isRetryableRpcError(new Error('connect ECONNREFUSED 127.0.0.1:26657'))).toBe(true)
    expect(isRetryableRpcError(new Error('getaddrinfo ENOTFOUND rpc.example.com'))).toBe(true)
    expect(isRetryableRpcError(new Error('socket hang up'))).toBe(true)
    expect(isRetryableRpcError(new Error('request timed out'))).toBe(true)
    expect(isRetryableRpcError(new Error('Bad status on response: 500'))).toBe(true)
    expect(isRetryableRpcError(new Error('Bad status on response: 503'))).toBe(true)
    expect(isRetryableRpcError(new Error('Bad status on response: 429'))).toBe(true)
  })

  it('does not retry HTTP 4xx (except 429)', () => {
    expect(isRetryableRpcError(new Error('Bad status on response: 400'))).toBe(false)
    expect(isRetryableRpcError(new Error('Bad status on response: 404'))).toBe(false)
    expect(isRetryableRpcError(new Error('invalid request'))).toBe(false)
  })

  it('treats chain rejection and unknown messages as non-retryable', () => {
    expect(isRetryableRpcError(new Error('insufficient funds: insufficient account funds'))).toBe(false)
    expect(isRetryableRpcError(new Error('account sequence mismatch, expected 5, got 4'))).toBe(false)
    expect(isRetryableRpcError(new Error('out of gas in location: WritePerByte'))).toBe(false)
    expect(isRetryableRpcError(new Error('failed to execute message; message index: 0'))).toBe(false)
    expect(isRetryableRpcError(new Error('something completely unexpected from cosmjs'))).toBe(false)
  })
})

describe('createRoundRobinExhaustedError', () => {
  it('includes last error message and cause', () => {
    const cause = new Error('Bad status on response: 500')
    const err = createRoundRobinExhaustedError('broadcast transaction', cause)
    expect(err.message).toContain('No clients available. Can not broadcast transaction')
    expect(err.message).toContain('Last error: Bad status on response: 500')
    expect((err as Error & { cause?: unknown }).cause).toBe(cause)
  })

  it('works without a last error', () => {
    const err = createRoundRobinExhaustedError('get chain id')
    expect(err.message).toBe('No clients available. Can not get chain id')
  })
})

describe('roundRobinTry', () => {
  it('returns the first successful result', async () => {
    const result = await roundRobinTry([1, 2, 3], 'test', async (n) => {
      if (n < 3) throw new Error('Failed to fetch')
      return n * 10
    })
    expect(result).toBe(30)
  })

  it('rethrows non-retryable errors immediately', async () => {
    await expect(
      roundRobinTry([1, 2], 'broadcast transaction', async () => {
        throw new Error('insufficient funds')
      }),
    ).rejects.toThrow('insufficient funds')
  })

  it('surfaces last retryable error when all endpoints fail', async () => {
    await expect(
      roundRobinTry(['a', 'b'], 'broadcast transaction', async (url) => {
        throw new Error(`Bad status on response: 500 from ${url}`)
      }),
    ).rejects.toThrow(/Last error: Bad status on response: 500 from b/)
  })

  it('throws exhausted error when item list is empty', async () => {
    await expect(roundRobinTry([], 'get chain id', async () => 1)).rejects.toThrow(
      'No clients available. Can not get chain id',
    )
  })
})

describe('roundRobinGetTx', () => {
  type FakeClient = { id: string }

  it('returns the first non-null tx', async () => {
    const clients: FakeClient[] = [{ id: 'a' }, { id: 'b' }]
    const tx = await roundRobinGetTx(clients, 'HASH', async (c) => (c.id === 'b' ? ({ height: 1 } as never) : null))
    expect(tx).toEqual({ height: 1 })
  })

  it('throws TxNotFoundError only when every client returns null', async () => {
    const clients: FakeClient[] = [{ id: 'a' }, { id: 'b' }]
    await expect(roundRobinGetTx(clients, 'HASH', async () => null)).rejects.toBeInstanceOf(TxNotFoundError)
  })

  it('null then retryable error → exhausted with last error (not TxNotFound)', async () => {
    const clients: FakeClient[] = [{ id: 'a' }, { id: 'b' }]
    await expect(
      roundRobinGetTx(clients, 'HASH', async (c) => {
        if (c.id === 'a') return null
        throw new Error('Bad status on response: 500')
      }),
    ).rejects.toThrow(/Last error: Bad status on response: 500/)
  })

  it('retryable error then null → exhausted with last error (not TxNotFound)', async () => {
    const clients: FakeClient[] = [{ id: 'a' }, { id: 'b' }]
    await expect(
      roundRobinGetTx(clients, 'HASH', async (c) => {
        if (c.id === 'a') throw new Error('Failed to fetch')
        return null
      }),
    ).rejects.toThrow(/Last error: Failed to fetch/)
  })

  it('rethrows non-retryable errors immediately', async () => {
    await expect(
      roundRobinGetTx([{ id: 'a' }, { id: 'b' }], 'HASH', async () => {
        throw new Error('insufficient funds')
      }),
    ).rejects.toThrow('insufficient funds')
  })
})

describe('TxNotFoundError', () => {
  it('names and message are stable for status pollers', () => {
    const err = new TxNotFoundError('ABC')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('TxNotFoundError')
    expect(err.txId).toBe('ABC')
    expect(err.message).toBe('Can not find transaction ABC')
  })
})

describe('isAlreadyBroadcastError', () => {
  it('matches mempool / already-exists messages', () => {
    expect(isAlreadyBroadcastError(new Error('tx already exists in cache'))).toBe(true)
    expect(isAlreadyBroadcastError(new Error('tx already in mempool'))).toBe(true)
    expect(isAlreadyBroadcastError(new Error('Failed to broadcast tx: already in mempool'))).toBe(true)
  })

  it('does not match unrelated errors', () => {
    expect(isAlreadyBroadcastError(new Error('request timed out'))).toBe(false)
    expect(isAlreadyBroadcastError(new Error('insufficient funds'))).toBe(false)
  })
})

describe('signOnceThenRoundRobinBroadcast', () => {
  const txBytesA = new Uint8Array([1, 2, 3, 4])
  const txBytesB = new Uint8Array([9, 9, 9, 9])
  const hashA = tendermintTxHash(txBytesA)

  it('signs once then rebroadcasts the same bytes after a timeout on the first URL', async () => {
    const signCalls: string[] = []
    const broadcastCalls: { url: string; bytes: Uint8Array }[] = []

    const result = await signOnceThenRoundRobinBroadcast(
      ['url0', 'url1'],
      async (url) => {
        signCalls.push(url)
        // First URL succeeds at signing — we must never sign again on url1
        return txBytesA
      },
      async (url, txBytes) => {
        broadcastCalls.push({ url, bytes: txBytes })
        if (url === 'url0') {
          throw new Error('request timed out')
        }
        // url1 would accept a *new* signature; we assert it only gets the same bytes
        return { transactionHash: tendermintTxHash(txBytes), code: 0 }
      },
    )

    expect(signCalls).toEqual(['url0'])
    expect(broadcastCalls).toHaveLength(2)
    expect(broadcastCalls[0].url).toBe('url0')
    expect(broadcastCalls[1].url).toBe('url1')
    expect(Array.from(broadcastCalls[0].bytes)).toEqual(Array.from(txBytesA))
    expect(Array.from(broadcastCalls[1].bytes)).toEqual(Array.from(txBytesA))
    expect(result.transactionHash).toBe(hashA)
    // Ensure we did not accidentally produce a second distinct payload
    expect(Array.from(broadcastCalls[1].bytes)).not.toEqual(Array.from(txBytesB))
  })

  it('treats already-in-mempool on the second URL as success with the known hash', async () => {
    const result = await signOnceThenRoundRobinBroadcast(
      ['url0', 'url1'],
      async () => txBytesA,
      async (url) => {
        if (url === 'url0') throw new Error('Bad status on response: 502')
        throw new Error('tx already exists in cache')
      },
    )
    expect(result.transactionHash).toBe(hashA)
    expect(result.code).toBe(0)
  })

  it('rethrows non-retryable chain errors during broadcast without trying the next URL', async () => {
    const broadcastUrls: string[] = []
    await expect(
      signOnceThenRoundRobinBroadcast(
        ['url0', 'url1'],
        async () => txBytesA,
        async (url) => {
          broadcastUrls.push(url)
          throw new Error('insufficient funds: insufficient account funds')
        },
      ),
    ).rejects.toThrow('insufficient funds')
    expect(broadcastUrls).toEqual(['url0'])
  })

  it('may try the next URL for sign if the first sign fails with a transport error', async () => {
    const signCalls: string[] = []
    const result = await signOnceThenRoundRobinBroadcast(
      ['url0', 'url1'],
      async (url) => {
        signCalls.push(url)
        if (url === 'url0') throw new Error('Failed to fetch')
        return txBytesA
      },
      async (_url, txBytes) => ({ transactionHash: tendermintTxHash(txBytes), code: 0 }),
    )
    expect(signCalls).toEqual(['url0', 'url1'])
    expect(result.transactionHash).toBe(hashA)
  })
})
