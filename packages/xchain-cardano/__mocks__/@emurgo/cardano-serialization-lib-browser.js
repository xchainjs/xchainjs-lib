const validAddress = {
  is_malformed: jest.fn().mockReturnValue(false),
  network_id: jest.fn().mockReturnValue(1),
}

const Cardano = {
  Address: {
    from_bech32: jest.fn().mockImplementation((address) => {
      const validAddresses = [
        'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhv',
        'addr_test1qpkjqjg3yfql7uspafzanp0xq4fvuqzgyewhqhcqnk94w4gk9jlajcx98yc9g8rxgw0zrdsprlkkjl4l2s9ls6hvxlsq3n089y',
      ]

      if (validAddresses.includes(address)) {
        return validAddress
      }
      throw new Error('Invalid address')
    }),
  },
  NetworkInfo: {
    mainnet: jest.fn().mockReturnValue({
      network_id: jest.fn().mockReturnValue(1),
    }),
    testnet_preprod: jest.fn().mockReturnValue({
      network_id: jest.fn().mockReturnValue(0),
    }),
  },
  Transaction: {
    from_hex: jest.fn().mockReturnValue({
      body: jest.fn().mockReturnValue({
        fee: jest.fn().mockReturnValue({
          to_js_value: jest.fn().mockReturnValue('155381'),
        }),
      }),
    }),
  },
  TransactionBuilder: {
    new: jest.fn().mockImplementation((_config) => ({
      add_input: jest.fn().mockReturnThis(),
      add_output: jest.fn().mockReturnThis(),
      set_ttl: jest.fn().mockReturnThis(),
      add_inputs_from: jest.fn().mockReturnThis(),
      add_change_if_needed: jest.fn().mockReturnThis(),
      set_metadata: jest.fn().mockReturnThis(),
      build_tx: jest.fn().mockReturnValue({
        to_hex: jest.fn().mockReturnValue('mock-tx-hex'),
      }),
    })),
  },
  TransactionBuilderConfigBuilder: {
    new: jest.fn().mockReturnValue({
      fee_algo: jest.fn().mockReturnThis(),
      pool_deposit: jest.fn().mockReturnThis(),
      key_deposit: jest.fn().mockReturnThis(),
      coins_per_utxo_byte: jest.fn().mockReturnThis(),
      max_value_size: jest.fn().mockReturnThis(),
      max_tx_size: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({}),
    }),
  },
  LinearFee: {
    new: jest.fn().mockReturnValue({}),
  },
  BigNum: {
    from_str: jest.fn().mockReturnValue({}),
  },
  TransactionOutput: {
    new: jest.fn().mockImplementation((_address, _value) => ({
      address: jest.fn().mockReturnValue(_address),
      amount: jest.fn().mockReturnValue(_value),
    })),
  },
  Value: {
    new: jest.fn().mockImplementation((_amount) => ({
      amount: jest.fn().mockReturnValue(_amount),
    })),
  },
  TransactionUnspentOutputs: {
    new: jest.fn().mockReturnValue({
      add: jest.fn().mockReturnThis(),
    }),
  },
  TransactionUnspentOutput: {
    new: jest.fn().mockImplementation((_input, _output) => ({
      input: jest.fn().mockReturnValue(_input),
      output: jest.fn().mockReturnValue(_output),
    })),
  },
  TransactionInput: {
    new: jest.fn().mockImplementation((_txHash, _index) => ({
      transaction_id: jest.fn().mockReturnValue(_txHash),
      index: jest.fn().mockReturnValue(_index),
    })),
  },
  TransactionHash: {
    from_bytes: (bytes) => ({
      to_bytes: () => bytes,
    }),
  },
  CoinSelectionStrategyCIP2: {
    LargestFirst: {},
  },
  GeneralTransactionMetadata: {
    new: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnThis(),
    }),
  },
  TransactionMetadatum: {
    new_text: jest.fn().mockReturnValue({}),
  },
}

module.exports = Cardano
