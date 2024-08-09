import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/thorchain\/pools/).reply(function () {
      const resp = require(`./responses/thornode/thornodePools.json`)
      return [200, resp]
    })
    //Mock thorchain/inbound_addresses
    mock.onGet(/\/thorchain\/inbound_addresses/).reply(function () {
      const resp = require(`./responses/thornode/inbound_addresses.json`)
      return [200, resp]
    })
    //Mock thornode observed tx
    mock.onGet(/\/thorchain\/tx\/276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC7F52/).reply(function () {
      const resp = require(`./responses/thornode/thornodeObservedTx.json`)
      return [200, resp]
    })
    //Mock thornode unobserved tx
    mock.onGet(/\/276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC/).reply(function () {
      const resp = require(`./responses/thornode/unobservedTx.json`)
      return [200, resp]
    })
    // Mock thornode incomplete tx
    mock.onGet(/\/thorchain\/tx\/28833B25B58B1907A3E4171E991DEB5E168A98829810F1215E0959D59BDD7CF5/).reply(function () {
      const resp = require('./responses/thornode/thornodeIncompleteTx.json')
      return [200, resp]
    })
    // Mock thornode block height difference
    mock.onGet(/\/thorchain\/tx\/E64875F5EF8B4EA94900EC86E7790A40D5397ED0AEAFA68EEB05964CAFB18BAE/).reply(function () {
      const resp = require('./responses/thornode/blockHeightDiff.json')
      return [200, resp]
    })
    // Mock scheduled queue
    mock.onGet(/\/thorchain\/queue\/scheduled/).reply(function () {
      const resp = require(`./responses/thornode/scheduledQueue.json`)
      return [200, resp]
    })
    // Mock last block
    mock.onGet(/\/thorchain\/lastblock/).reply(function () {
      const resp = require(`./responses/thornode/lastBlock.json`)
      return [200, resp]
    })
    // Mock Outbound Confirmed tx
    mock.onGet(/\/thorchain\/tx\/776CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC7F53/).reply(function () {
      const resp = require('./responses/thornode/thornodeTx.json')
      return [200, resp]
    })
    mock.onGet(/\/thorchain\/thorname\/odin/).reply(function () {
      const resp = require('./responses/thornode/thorname.json')
      return [200, resp]
    })
    mock.onGet(/\/thorchain\/constants/).reply(function () {
      const resp = require(`./responses/thornode/constants.json`)
      return [200, resp]
    })
    mock.onGet(/\/thorchain\/quote\/swap/).reply(function (config) {
      const parsedUrl = new URL(`${config.url}`)
      const from_asset = parsedUrl.searchParams.get('from_asset') ?? ''
      const to_asset = parsedUrl.searchParams.get('to_asset') ?? ''
      if (from_asset === 'AVAX~AVAX' && to_asset === 'ETH~ETH') {
        const resp = require(`./responses/thornode/tradeSwap.json`)
        return [200, resp]
      }
      return [500, { error: 'Not found' }]
    })
  },
}
