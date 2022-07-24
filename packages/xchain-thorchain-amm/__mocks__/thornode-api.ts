import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
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
  },
}
