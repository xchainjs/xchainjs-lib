import mock, { importjson } from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    //Mock testnet thorchain/inbound_addresses
    mock.onGet(/testnet(.*)\/thorchain\/inbound_addresses/).reply(async () => {
      const resp = await importjson(`./response/thornode/inbound_addresses_testnet.json`)
      return [200, resp]
    })

    //Mock thorchain/inbound_addresses
    mock.onGet(/\/thorchain\/inbound_addresses/).reply(async () => {
      const resp = await importjson(`./response/thornode/inbound_addresses.json`)
      return [200, resp]
    })

    //Mock thorchain/mimir
    mock.onGet(/\/thorchain\/mimir/).reply(async () => {
      const resp = await importjson(`./response/thornode/mimir.json`)
      return [200, resp]
    })
  },
}
