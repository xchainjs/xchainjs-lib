import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    //Mock thornode observed tx
    mock.onGet(/\/thorchain\/tx/).reply(function () {
      const resp = require(`./responses/thornode/thornodeTx.json`)
      return [200, resp]
    })
    //Mock thornode unobserved tx
    mock.onGet(/\/thorchain\/tx\/276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC/).reply(function () {
      const resp = require(`./responses/thornode//unobservedTx.json`)
      return [404, resp]
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
  },
}
