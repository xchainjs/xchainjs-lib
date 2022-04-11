import nock from 'nock'

export default {
  restore: () => {
    // nock.restore()
  },
  init: () => {
    // Testnet `gas_prices`
    // https://bombay-fcd.terra.dev/v1/txs/gas_prices
    nock('https://bombay-fcd.terra.dev')
      .get(/v1\/txs\/gas_prices/)
      .reply(200, require(`./response/terra/gas-testnet.json`))

    // // Testnet `accounts`
    // // https://bombay-fcd.terra.dev/cosmos/auth/v1beta1/accounts/{account}
    nock('https://bombay-fcd.terra.dev')
      .get(/cosmos\/auth\/v1beta1\/accounts\//)
      .reply(200, require(`./response/terra/accounts/terra1hf2j3w46zw8lg25awgan7x8wwsnc509sk0e6gr-testnet.json`))

    // Testnet `simulate`
    // https://bombay-fcd.terra.dev/cosmos/tx/v1beta1/simulate
    nock('https://bombay-fcd.terra.dev')
      .post(/cosmos\/tx\/v1beta1\/simulate/)
      .reply(201, () => {
        // Used to return `gas_used` value only
        const response = require(`./response/terra/simulate-testnet.json`)
        return response
      })

    // Testnet `compute_tax`
    // https://bombay-fcd.terra.dev/terra/tx/v1beta1/compute_tax
    nock('https://bombay-fcd.terra.dev')
      .post(/terra\/tx\/v1beta1\/compute_tax/)
      .reply(201, () => require(`./response/terra/tax-testnet.json`))
  },
}
