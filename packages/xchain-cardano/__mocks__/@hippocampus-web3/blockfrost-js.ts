export class BlockFrostAPI {
  addresses(address: string) {
    if (
      address ===
      'addr1zyq0kyrml023kwjk8zr86d5gaxrt5w8lxnah8r6m6s4jp4g3r6dxnzml343sx8jweqn4vn3fz2kj8kgu9czghx0jrsyqqktyhv'
    ) {
      return {
        address,
        amount: [
          {
            unit: 'lovelace',
            quantity: '133884551384',
          },
          {
            unit: '000ffeb007da43324aefe044555fbe5bc469c38aa5063f95dc2ff72a536e656b2052657761726473',
            quantity: '1',
          },
          {
            unit: '05481566c1accd189a6cf46f8d17d794c918101eaa313e9a62aed3a7707473',
            quantity: '9870000',
          },
        ],
      }
    }
    return {
      address,
      amount: [],
    }
  }

  epochsLatestParameters() {
    return {
      min_fee_a: 44,
      min_fee_b: 155381,
      pool_deposit: '500000000',
      key_deposit: '2000000',
      coins_per_utxo_size: '4310',
      max_val_size: '5000',
      max_tx_size: 16384,
    }
  }

  blocksLatest() {
    return {
      time: 1729772353,
      height: 11004101,
      hash: '257910842d76c0bfe4f75af50021f1327a5556b125de020ad0b4df216e06ada3',
      slot: 138206062,
      epoch: 517,
      epoch_slot: 225262,
      slot_leader: 'pool1qvudfuw9ar47up5fugs53s2g84q3c4v86z4es6uwsfzzs89rwha',
      size: 791,
      tx_count: 1,
      output: '10094545172',
      fees: '190317',
      block_vrf: 'vrf_vk1kwuaxe3d34my778e4fwyewhtuj7s3rnenvyny4pa0qjdf382tycq8dqdm8',
      op_cert: '5fab63c90a2820b7ba94f3fd1f1f113a38078357a1476dad543b8ba7335c7803',
      op_cert_counter: '8',
      previous_block: '874a6e5a50cb95b8cc806aa64273fb60950f2330b00bd5d4412fdc28f0ea02be',
      next_block: null,
      confirmations: 0,
    }
  }

  addressesUtxosAll(address: string) {
    if (
      address ===
      'addr1q8h6u88370nw2va448ukdj9spujm5an7nce8j0qg6hzg0kw5xxq3r3rcel85zeezwm5w9e3l449j0gudvge3c9tht68s2uw5gk'
    ) {
      return [
        {
          address:
            'addr1q8h6u88370nw2va448ukdj9spujm5an7nce8j0qg6hzg0kw5xxq3r3rcel85zeezwm5w9e3l449j0gudvge3c9tht68s2uw5gk',
          tx_hash: 'ae2865207c23488bb6433a96df149d5297f0da53807b3c259c6ab11b77b78384',
          tx_index: 0,
          output_index: 0,
          amount: [
            {
              quantity: 212000000,
              unit: 'lovelace',
            },
            {
              quantity: 49999788000000,
              unit: 'lovelace',
            },
          ],
          block: 'd25f5841505a9c610d97d0356bb06afaff0e9d2fbb79e39f55f6babd6cab206a',
          data_hash: null,
          inline_datum: null,
          reference_script_hash: null,
        },
        {
          address:
            'addr1q8h6u88370nw2va448ukdj9spujm5an7nce8j0qg6hzg0kw5xxq3r3rcel85zeezwm5w9e3l449j0gudvge3c9tht68s2uw5gk',
          tx_hash: '6b8cf522fd97792bbe0cb03a1c057ac41c5e26338a31515c2c022cb0bee9f2a2',
          tx_index: 0,
          output_index: 0,
          amount: [[Object]],
          block: '7ce8585cfdaaef4a0bb3892c8cda396fe057d8ea82a9ccfa412cc392cce35a61',
          data_hash: null,
          inline_datum: null,
          reference_script_hash: null,
        },
      ]
    }
    return []
  }

  txs(hash: string) {
    if (hash === '6b8cf522fd97792bbe0cb03a1c057ac41c5e26338a31515c2c022cb0bee9f2a2') {
      return {
        hash: '6b8cf522fd97792bbe0cb03a1c057ac41c5e26338a31515c2c022cb0bee9f2a2',
        block: '7ce8585cfdaaef4a0bb3892c8cda396fe057d8ea82a9ccfa412cc392cce35a61',
        block_height: 10550920,
        block_time: 1720535411,
        slot: 128969120,
        index: 6,
        output_amount: [
          {
            unit: 'lovelace',
            quantity: '69382438711776',
          },
        ],
        fees: '170499',
        deposit: '0',
        size: 297,
        invalid_before: null,
        invalid_hereafter: '128972632',
        utxo_count: 3,
        withdrawal_count: 0,
        mir_cert_count: 0,
        delegation_count: 0,
        stake_cert_count: 0,
        pool_update_count: 0,
        pool_retire_count: 0,
        asset_mint_or_burn_count: 0,
        redeemer_count: 0,
        valid_contract: true,
      }
    }
    throw Error('Can not get transaction')
  }

  txsUtxos(hash: string) {
    if (hash === '6b8cf522fd97792bbe0cb03a1c057ac41c5e26338a31515c2c022cb0bee9f2a2') {
      return {
        hash: '6b8cf522fd97792bbe0cb03a1c057ac41c5e26338a31515c2c022cb0bee9f2a2',
        inputs: [
          {
            address:
              'addr1q88p8j5jgpujpf33l5ja2rreearp3x9x59ju65hxkhu29jvctwav0g4zrrmq388yc7h22qehlyt4y556atrty5sfdq5q7plfz5',
            amount: [
              {
                unit: 'lovelace',
                quantity: '69382438882275',
              },
            ],
            tx_hash: 'ae2865207c23488bb6433a96df149d5297f0da53807b3c259c6ab11b77b78384',
            output_index: 1,
            data_hash: null,
            inline_datum: null,
            reference_script_hash: null,
            collateral: false,
            reference: false,
          },
        ],
        outputs: [
          {
            address:
              'addr1q8h6u88370nw2va448ukdj9spujm5an7nce8j0qg6hzg0kw5xxq3r3rcel85zeezwm5w9e3l449j0gudvge3c9tht68s2uw5gk',
            amount: [
              {
                unit: 'lovelace',
                quantity: '49999788000000',
              },
            ],
            output_index: 0,
            data_hash: null,
            inline_datum: null,
            collateral: false,
            reference_script_hash: null,
            consumed_by_tx: null,
          },
          {
            address:
              'addr1q88p8j5jgpujpf33l5ja2rreearp3x9x59ju65hxkhu29jvctwav0g4zrrmq388yc7h22qehlyt4y556atrty5sfdq5q7plfz5',
            amount: [
              {
                unit: 'lovelace',
                quantity: '19382650711776',
              },
            ],
            output_index: 1,
            data_hash: null,
            inline_datum: null,
            collateral: false,
            reference_script_hash: null,
            consumed_by_tx: '4310f1833be7a524683d55fe0751663bd816b4bae504686ce062fa0a017fe07c',
          },
        ],
      }
    }
    throw Error('Can not get transaction utxos')
  }
}
