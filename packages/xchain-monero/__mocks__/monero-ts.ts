const mockWalletKeys = {
  getPrimaryAddress: jest
    .fn()
    .mockResolvedValue(
      '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
    ),
  close: jest.fn(),
}

const mockWalletFull = {
  sync: jest.fn().mockResolvedValue(undefined),
  getBalance: jest.fn().mockResolvedValue(BigInt('5000000000000')),
  getTransfers: jest.fn().mockResolvedValue([]),
  createTx: jest
    .fn()
    .mockResolvedValue({ getHash: () => 'abc123def456789012345678901234567890123456789012345678901234abcd' }),
  relayTx: jest.fn().mockResolvedValue('abc123def456789012345678901234567890123456789012345678901234abcd'),
  close: jest.fn(),
}

const mockDaemon = {
  getFeeEstimate: jest.fn().mockResolvedValue({
    getFee: () => BigInt('20000000'),
  }),
  getTx: jest.fn().mockImplementation((txId: string) => {
    if (txId === 'fakeTxHash') {
      return {
        getHash: () => 'fakeTxHash',
        getFee: () => BigInt('20000000'),
        getBlock: () => ({
          getTimestamp: () => 1700000000,
        }),
      }
    }
    return null
  }),
  submitTxHex: jest.fn().mockResolvedValue({
    getIsGood: () => true,
  }),
}

const moneroTs = {
  createWalletKeys: jest.fn().mockResolvedValue(mockWalletKeys),
  createWalletFull: jest.fn().mockResolvedValue(mockWalletFull),
  connectToDaemonRpc: jest.fn().mockResolvedValue(mockDaemon),
}

export default moneroTs
module.exports = moneroTs
