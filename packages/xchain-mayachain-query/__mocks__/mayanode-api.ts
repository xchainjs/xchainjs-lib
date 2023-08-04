import mock from './axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    //Mock mayachain/inbound_addresses
    mock.onGet(/\/mayachain\/inbound_addresses/).reply(function () {
      const resp = require(`./responses/mayanode/inbound_addresses.json`)
      return [200, resp]
    })

    //Mock mayachain/inbound_addresses
    mock.onGet(/\/mayachain\/quote/).reply(function (config) {
      const parsedUrl = new URL(`${config.url}`)
      const from_asset = parsedUrl.searchParams.get("from_asset") ?? ""
      const to_asset = parsedUrl.searchParams.get("to_asset") ?? ""
      if(from_asset.match('/')) {
        const resp = require(`./responses/mayanode/s${from_asset.split('/')[0]}SwapTos${to_asset.split('/')[0]}.json`)
        return [200, resp];
      } else {
        const resp = require(`./responses/mayanode/${from_asset.split('.')[0]}SwapTo${to_asset.split('.')[0]}.json`)
        return [200, resp];
      }
    })

    //Mock mayanode pools
    mock.onGet(/\/mayachain\/pools/).reply(function () {
      const resp = require(`./responses/mayanode/thornodePools.json`)
      return [200, resp]
    })
    //Mock mayanode observed tx
    mock.onGet(/\/mayachain\/tx\/276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC7F52/).reply(function () {
      const resp = require(`./responses/mayanode/thornodeObservedTx.json`)
      return [200, resp]
    })
    //Mock mayanode unobserved tx
    mock.onGet(/\/mayachain\/tx\/276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC/).reply(function () {
      const resp = require(`./responses/mayanode/unobservedTx.json`)
      return [200, resp]
    })
    // Mock mayanode incomplete tx
    mock.onGet(/\/mayachain\/tx\/28833B25B58B1907A3E4171E991DEB5E168A98829810F1215E0959D59BDD7CF5/).reply(function () {
      const resp = require('./responses/mayanode/thornodeIncompleteTx.json')
      return [200, resp]
    })
    // Mock mayanode block height difference
    mock.onGet(/\/mayachain\/tx\/E64875F5EF8B4EA94900EC86E7790A40D5397ED0AEAFA68EEB05964CAFB18BAE/).reply(function () {
      const resp = require('./responses/mayanode/blockHeightDiff.json')
      return [200, resp]
    })
    // Mock scheduled queue
    mock.onGet(/\/mayachain\/queue\/scheduled/).reply(function () {
      const resp = require(`./responses/mayanode/scheduledQueue.json`)
      return [200, resp]
    })
    // Mock scheduled queue
    mock.onGet(/\/mayachain\/queue/).reply(function () {
      const resp = require(`./responses/mayanode/queue.json`)
      return [200, resp]
    })
    // Mock last block
    mock.onGet(/\/mayachain\/lastblock/).reply(function () {
      const resp = require(`./responses/mayanode/lastBlock.json`)
      return [200, resp]
    })

    // Mock Outbound Confirmed tx
    mock.onGet(/\/mayachain\/tx\/776CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC7F53/).reply(function () {
      const resp = require('./responses/mayanode/thornodeTx.json')
      return [200, resp]
    })
    // Mock constants tx
    mock.onGet(/\/mayachain\/constants/).reply(function () {
      const resp = require('./responses/mayanode/constants.json')
      return [200, resp]
    })
    // Mock mimir tx
    mock.onGet(/\/mayachain\/mimir/).reply(function () {
      const resp = require('./responses/mayanode/mimir.json')
      return [200, resp]
    })
  },
}
