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
    new: jest.fn().mockImplementation((_config) => {
      const builder = {
        add_input: jest.fn().mockReturnThis(),
        add_output: jest.fn().mockReturnThis(),
        add_regular_input: jest.fn().mockReturnThis(),
        set_ttl: jest.fn().mockReturnThis(),
        add_inputs_from: jest.fn().mockReturnThis(),
        add_change_if_needed: jest.fn().mockReturnThis(),
        // Legacy label-674 path. Kept so tests can assert the memo path no longer uses it.
        set_metadata: jest.fn().mockReturnThis(),
        // Conway aux-data path. Records the attached AuxiliaryData for introspection in tests.
        set_auxiliary_data: jest.fn(function (auxData) {
          this._auxData = auxData
          return this
        }),
        set_fee: jest.fn().mockReturnThis(),
        min_fee: jest.fn().mockReturnValue({
          to_str: jest.fn().mockReturnValue('155381'),
        }),
        build_tx: jest.fn().mockReturnValue({
          to_hex: jest.fn().mockReturnValue('mock-tx-hex'),
        }),
      }
      Cardano.__builders.push(builder)
      return builder
    }),
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
    // Records the string so tests can assert which metadata label was used (6676 vs legacy 674).
    from_str: jest.fn().mockImplementation((value) => ({ value })),
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
  // Metadata is modelled as plain tagged objects so the structure the client builds can be
  // introspected and decoded back to JSON the way the real serialization library would.
  GeneralTransactionMetadata: {
    new: jest.fn().mockImplementation(() => {
      const byLabel = new Map()
      return {
        insert: jest.fn(function (label, metadatum) {
          byLabel.set(label.value, metadatum)
          return this
        }),
        get: (label) => byLabel.get(label.value),
      }
    }),
  },
  MetadataList: {
    new: jest.fn().mockImplementation(() => {
      const items = []
      return {
        items,
        add: jest.fn((metadatum) => items.push(metadatum)),
      }
    }),
  },
  MetadataMap: {
    new: jest.fn().mockImplementation(() => {
      const entries = []
      return {
        entries,
        insert: jest.fn(function (key, value) {
          entries.push([key, value])
          return this
        }),
      }
    }),
  },
  TransactionMetadatum: {
    new_text: jest.fn().mockImplementation((text) => ({ kind: 'text', text })),
    new_list: jest.fn().mockImplementation((list) => ({ kind: 'list', list })),
    new_map: jest.fn().mockImplementation((map) => ({ kind: 'map', map })),
  },
  AuxiliaryData: {
    new: jest.fn().mockImplementation(() => {
      const auxData = {
        _metadata: undefined,
        _preferAlonzo: false,
        set_metadata: jest.fn(function (metadata) {
          this._metadata = metadata
        }),
        set_prefer_alonzo_format: jest.fn(function (prefer) {
          this._preferAlonzo = prefer
        }),
        metadata() {
          return this._metadata
        },
      }
      return auxData
    }),
  },
  MetadataJsonSchema: {
    BasicConversions: 'BasicConversions',
  },
  // Mirrors @emurgo's decode_metadatum_to_json_str for the tagged objects above: text -> string,
  // list -> array, map (text keys only) -> object. Sufficient for the swap-memo shape.
  decode_metadatum_to_json_str: jest.fn().mockImplementation((metadatum) => {
    const decode = (node) => {
      switch (node.kind) {
        case 'text':
          return node.text
        case 'list':
          return node.list.items.map(decode)
        case 'map': {
          const obj = {}
          for (const [key, value] of node.map.entries) obj[decode(key)] = decode(value)
          return obj
        }
        default:
          throw new Error(`Unsupported metadatum kind: ${node.kind}`)
      }
    }
    return JSON.stringify(decode(metadatum))
  }),
}

// Records every TransactionBuilder created during a test so assertions can inspect the auxiliary
// data attached to the builder for a given prepareTx/prepareMaxTx call.
Cardano.__builders = []

module.exports = Cardano
