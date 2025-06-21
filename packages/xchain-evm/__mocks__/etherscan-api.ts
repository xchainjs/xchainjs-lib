import mock from './axios-adapter'

export const mock_gas_oracle_custom = (
  baseUrl: string,
  _chainId: number,
  gasValues: {
    SafeGasPrice: string
    ProposeGasPrice: string
    FastGasPrice: string
    LastBlock?: string
  },
) => {
  const urlPattern = new RegExp(
    `${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/api\\?.*module=gastracker.*action=gasoracle.*`,
  )

  mock.onGet(urlPattern).reply(200, {
    status: '1',
    message: 'OK',
    result: {
      LastBlock: gasValues.LastBlock || '123456789',
      ...gasValues,
    },
  })
}
