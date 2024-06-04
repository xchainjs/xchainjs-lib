import {
  StateEntityDetailsVaultResponseItem,
  StateEntityFungiblesPageResponse,
  StateEntityNonFungiblesPageResponse,
  TransactionCommittedDetailsResponse,
} from '@radixdlt/babylon-gateway-api-sdk'

export const stateEntityNonFungiblesPageResponse: StateEntityNonFungiblesPageResponse = {
  ledger_state: {
    network: 'mainnet',
    state_version: 81621336,
    proposer_round_timestamp: '2024-05-09T16:32:42.806Z',
    epoch: 97073,
    round: 500,
  },
  total_count: 12,
  items: [
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1nfjwgcljh2nhn5zzp3arc9whnp0p39u6unfmzmeqv9jhp206zkcfy6',
      amount: 1,
      last_updated_at_state_version: 79357936,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1ntvmy08hnz5ye090yug4fznnewnjdaptnl0d97uygusgvpzx9hyxk4',
      amount: 0,
      last_updated_at_state_version: 74657816,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1nfuf2z370tt7nr6gpjje60tq9zdksj0lgwmpcfdchkscnha0422dfp',
      amount: 0,
      last_updated_at_state_version: 64277239,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1nt7uscrcl2dxtugxzl5wws92fwm2rl2g7e4v66ane49kkn7xdmpftz',
      amount: 0,
      last_updated_at_state_version: 61159030,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1ntyg43hlwegw6q9f4v074ruxvke3keykfnew4kmnu57k9dawu94t8l',
      amount: 0,
      last_updated_at_state_version: 50831336,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1ngpnrpyhl0hspjdrwsjmlhr6tgrkw7sqq9edrs5jcewxg5n3h2ukg4',
      amount: 0,
      last_updated_at_state_version: 39404310,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1ntrysy2sncpj6t6shjlgsfr55dns9290e2zsy67fwwrp6mywsrrgsc',
      amount: 0,
      last_updated_at_state_version: 37701899,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1ntfanvrnhntxdvc9skrepp2pvdvve00607ws7senfkys0pyxr7a8lt',
      amount: 0,
      last_updated_at_state_version: 36560157,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1nfzpyryg5x5x3586dgcka44884f99rjcrusvwgkkc3jatzuwk6tflp',
      amount: 0,
      last_updated_at_state_version: 35968945,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1ng59sgyq5uu3nlmstnkuavqvsjzg7f8hrlst4hreymydxpx9csxt40',
      amount: 0,
      last_updated_at_state_version: 35968818,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1nt3frmqu4v57dy55e90n0k3uy352zyy89vszzamvjld6vqvr98rls9',
      amount: 1,
      last_updated_at_state_version: 23594970,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1nfyg2f68jw7hfdlg5hzvd8ylsa7e0kjl68t5t62v3ttamtejc9wlxa',
      amount: 1,
      last_updated_at_state_version: 20938459,
    },
  ],
  address: 'account_rdx16x47guzq44lmplg0ykfn2eltwt5wweylpuupstsxnfm8lgva7tdg2w',
}

export const stateEntityFungiblesPageResponse: StateEntityFungiblesPageResponse = {
  ledger_state: {
    network: 'mainnet',
    state_version: 81620626,
    proposer_round_timestamp: '2024-05-09T16:30:09.559Z',
    epoch: 97072,
    round: 1141,
  },
  total_count: 28,
  items: [
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
      amount: '30.245803886130725575',
      last_updated_at_state_version: 79357936,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1th2hexq3yrz8sj0nn3033gajnj7ztl0erp4nn9mcl5rj9au75tum0u',
      amount: '0.000000109468214492',
      last_updated_at_state_version: 39686136,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf',
      amount: '2367.538644471972121542',
      last_updated_at_state_version: 39406565,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1tk9xrt4jxsavkmqp8e4xc9u2vwk3n672n4jzmvxrrujhts5sr4e67q',
      amount: '0.000000000000051492',
      last_updated_at_state_version: 39406565,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1tkk83magp3gjyxrpskfsqwkg4g949rmcjee4tu2xmw93ltw2cz94sq',
      amount: '1131.191721666815934647',
      last_updated_at_state_version: 36560157,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1t554n6l00f208regjt9xj2av0en8pueqyjldqd2u6tdvtrclrs4ev3',
      amount: '14981.654110658061435855',
      last_updated_at_state_version: 36536616,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1t480axsxfrps66t3cw89mtusmssgrnf2y22q6vw709ez4cupc9sjdv',
      amount: '17229.4056806375759515',
      last_updated_at_state_version: 36536616,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1t5n6agexw646tgu3lkr8n0nvt69z00384mhrlfuxz75wprtg9wwllq',
      amount: '0',
      last_updated_at_state_version: 35971242,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1tkjwu04wu5efa4z0zvg060yw9pga62z8n7mz40nx7vulrtvtnaf687',
      amount: '0',
      last_updated_at_state_version: 35971242,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1t4xkx270sg2hs397dzetux64c3q0gzpa2kjepetrf6mqkz3k35hm9j',
      amount: '30',
      last_updated_at_state_version: 35971242,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1thn6xa5vjdh5zagqzvxkxpd70r6eadpzmzr83m20ayp3yhxrjavxz5',
      amount: '100',
      last_updated_at_state_version: 35971242,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1t4qs620v3r9uzs6744eas47vdxnf39407hhh82c09cvvj2sqz8h4h5',
      amount: '10045.504285284042544108',
      last_updated_at_state_version: 35665278,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1t4vg8t8lgrnc2dljh4xgmhj3v6rpq7ph2f9u7ve7k6nw48xfvg5xmy',
      amount: '1',
      last_updated_at_state_version: 28853986,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1t4p39fd9n7zr7jpzljdha25axxlhcmtwqwt2a0j2tn9hkrjrn0yfwa',
      amount: '0.066197483157830618',
      last_updated_at_state_version: 28822614,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1t5muwkqqthsv2w25syfmeef3yul6qc7vs0phulms2hyazf9p863zpq',
      amount: '217.998933387078304076',
      last_updated_at_state_version: 28794316,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1thdd8kqdcg0vyqh77dpyksuxsan5y9ry2u9d00pewx6mkeug7r92qz',
      amount: '0',
      last_updated_at_state_version: 23597617,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1t5tsyyh82jxjrg7lrat7y5f7mcuxcch6d3jkc75l8et3n2n6h32kvd',
      amount: '35',
      last_updated_at_state_version: 21327218,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1thlnv2lydu7np9w8guguqslkydv000d7ydn7uq0sestql96hrfml0v',
      amount: '10',
      last_updated_at_state_version: 21327218,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1t4dy69k6s0gv040xa64cyadyefwtett62ng6xfdnljyydnml7t6g3j',
      amount: '2346',
      last_updated_at_state_version: 21326355,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1th3adk93ale3n8nzrypghtkasczmpt42qamq7x5dy8lsu3uwycvh4n',
      amount: '11059.089986398643523302',
      last_updated_at_state_version: 20937160,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1tkmh5qa5vgluvxwxyxjkjv9vgaln64t8v0j3vzz9rsf4u69rt2ljv7',
      amount: '599',
      last_updated_at_state_version: 516,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1t5g0w9fhz344t5ywqrcy59p3cyhqgwc9atxhm78jle08nrhrr24cc2',
      amount: '119.54203569797823488',
      last_updated_at_state_version: 497,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1t4qfgjm35dkwdrpzl3d8pc053uw9v4pj5wfek0ffuzsp73evye6wu6',
      amount: '2506183.550227893234696192',
      last_updated_at_state_version: 404,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1thunnyrarlduxy0x4j7sedzfvj0cxjf8cgnfcl7xn756txy7xcdqkl',
      amount: '101000',
      last_updated_at_state_version: 351,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1thj4t8073p2jkytk3fcr2mc39ehnecq4f9cuknakpy2zyaz63v6mdt',
      amount: '10000',
      last_updated_at_state_version: 225,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1t5a4c33dsr72l9h5v2hspa2ye9jzmptjkzky42s8ay6nfr67rvj4lv',
      amount: '1',
      last_updated_at_state_version: 128,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1th8zw0meumt5t60hdaak8xmc5talrpmphjj2htjutsen02pty9zsd9',
      amount: '1002022',
      last_updated_at_state_version: 104,
    },
    {
      aggregation_level: 'Global',
      resource_address: 'resource_rdx1thtyxvkkn96dyauuws5f78f6yevh2955decu24p3wtxgcurvjflec3',
      amount: '7168.904729368610817137',
      last_updated_at_state_version: 8,
    },
  ],
  address: 'account_rdx16x47guzq44lmplg0ykfn2eltwt5wweylpuupstsxnfm8lgva7tdg2w',
}

export const mockCommittedDetailsResponse: TransactionCommittedDetailsResponse = {
  ledger_state: {
    network: 'mainnet',
    state_version: 73378251,
    proposer_round_timestamp: '2024-04-19T15:54:47.591Z',
    epoch: 91305,
    round: 1071,
  },
  transaction: {
    transaction_status: 'CommittedSuccess',
    state_version: 73022080,
    epoch: 91055,
    round: 1145,
    round_timestamp: '2024-04-18T19:05:01.117Z',
    payload_hash: 'notarizedtransaction_rdx1h92j298aw35ty5ph65qj9kwswva9njvsq8796u93pgwsy35edzzsqk538t',
    intent_hash: 'txid_rdx195z9zjp43qvqk8fnzmnpazv5m7jsaepq6cnm5nnnn5p3m2573rvqamjaa8',
    fee_paid: '0.24701070443',
    confirmed_at: new Date('2024-04-18T19:05:01.117Z'),
    raw_hex:
      '4d2202022104210707010a88130000000000000a8a13000000000000093695d9e42201012007205c180935949806e6c7532e63d8cc75be10cb1e56a40e23d193fc4a9e8ee9eba6010108000020220441038000d148b7923acafac9ccc1ab794cda7e000ebbf3f0f51e0d2460a19c7424140c086c6f636b5f6665652101850000f444829163450000000000000000000000000000000041038000d148b7923acafac9ccc1ab794cda7e000ebbf3f0f51e0d2460a19c7424140c087769746864726177210280005da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c68500c025b0023ae64001000000000000000000000000000000000280005da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c68500c025b0023ae6400100000000000000000000000000000041038000d1abe47040ad7fb0fd0f25933567eb72e8e7649f0f38182e069a767fa19d0c147472795f6465706f7369745f6f725f61626f727421028100000000220000202000220000202200',
    receipt: {
      status: 'CommittedSuccess',
    },
    manifest_classes: ['Transfer', 'General'],
  },
}

export const mockEntityDeatilsResponse: StateEntityDetailsVaultResponseItem[] = [
  {
    address: 'resource_rdx1t480axsxfrps66t3cw89mtusmssgrnf2y22q6vw709ez4cupc9sjdv',
    fungible_resources: {
      total_count: 0,
      items: [],
    },
    non_fungible_resources: {
      total_count: 0,
      items: [],
    },
    metadata: {
      total_count: 5,
      items: [
        {
          key: 'tags',
          value: {
            raw_hex: '5c228001200c00',
            programmatic_json: {
              kind: 'Enum',
              variant_id: 128,
              fields: [
                {
                  kind: 'Array',
                  element_kind: 'String',
                  elements: [],
                },
              ],
            },
            typed: {
              type: 'StringArray',
              values: [],
            },
          },
          is_locked: true,
          last_updated_at_state_version: 3,
        },
        {
          key: 'icon_url',
          value: {
            raw_hex:
              '5c220d010c3d68747470733a2f2f6173736574732e7261646978646c742e636f6d2f69636f6e732f69636f6e2d6c69717569645f7374616b655f756e6974732e706e67',
            programmatic_json: {
              kind: 'Enum',
              variant_id: 13,
              fields: [
                {
                  kind: 'String',
                  value: 'https://assets.radixdlt.com/icons/icon-liquid_stake_units.png',
                },
              ],
            },
            typed: {
              type: 'Url',
              value: 'https://assets.radixdlt.com/icons/icon-liquid_stake_units.png',
            },
          },
          is_locked: true,
          last_updated_at_state_version: 3,
        },
        {
          key: 'description',
          value: {
            raw_hex:
              '5c2200010c694c6971756964205374616b6520556e697420746f6b656e73207468617420726570726573656e7420612070726f706f7274696f6e206f6620585244207374616b652064656c65676174656420746f2061205261646978204e6574776f726b2076616c696461746f722e',
            programmatic_json: {
              kind: 'Enum',
              variant_id: 0,
              fields: [
                {
                  kind: 'String',
                  value:
                    'Liquid Stake Unit tokens that represent a proportion of XRD stake delegated to a Radix Network validator.',
                },
              ],
            },
            typed: {
              type: 'String',
              value:
                'Liquid Stake Unit tokens that represent a proportion of XRD stake delegated to a Radix Network validator.',
            },
          },
          is_locked: true,
          last_updated_at_state_version: 3,
        },
        {
          key: 'validator',
          value: {
            raw_hex: '5c220801808329428aca1155e76f05aeab620492fae43be7f8d8cc7a9f468fa0cd1ba3',
            programmatic_json: {
              kind: 'Enum',
              variant_id: 8,
              fields: [
                {
                  kind: 'Reference',
                  value: 'validator_rdx1sv559zk2z927wmc9464kypyjltjrhelcmrx8486x37sv6xartj5x8h',
                },
              ],
            },
            typed: {
              type: 'GlobalAddress',
              value: 'validator_rdx1sv559zk2z927wmc9464kypyjltjrhelcmrx8486x37sv6xartj5x8h',
            },
          },
          is_locked: true,
          last_updated_at_state_version: 3,
        },
        {
          key: 'name',
          value: {
            raw_hex: '5c2200010c124c6971756964205374616b6520556e697473',
            programmatic_json: {
              kind: 'Enum',
              variant_id: 0,
              fields: [
                {
                  kind: 'String',
                  value: 'Liquid Stake Units',
                },
              ],
            },
            typed: {
              type: 'String',
              value: 'Liquid Stake Units',
            },
          },
          is_locked: true,
          last_updated_at_state_version: 3,
        },
      ],
    },
    details: {
      type: 'FungibleResource',
      role_assignments: {
        owner: {
          rule: {
            type: 'Protected',
            access_rule: {
              type: 'ProofRule',
              proof_rule: {
                type: 'Require',
                requirement: {
                  type: 'NonFungible',
                  non_fungible: {
                    local_id: {
                      id_type: 'Bytes',
                      sbor_hex: '5cc002206f4d519f1bbc994fd7399ebecb16de79a441d4a9fae9e85cb78801e787e69ad5',
                      simple_rep: '[6f4d519f1bbc994fd7399ebecb16de79a441d4a9fae9e85cb78801e787e69ad5]',
                    },
                    resource_address: 'resource_rdx1nfxxxxxxxxxxglcllrxxxxxxxxx002350006550xxxxxxxxxglcllr',
                  },
                },
              },
            },
          },
          updater: 'None',
        },
        entries: [
          {
            role_key: {
              name: 'burner',
              module: 'Main',
            },
            assignment: {
              resolution: 'Explicit',
              explicit_rule: {
                type: 'Protected',
                access_rule: {
                  type: 'ProofRule',
                  proof_rule: {
                    type: 'Require',
                    requirement: {
                      type: 'NonFungible',
                      non_fungible: {
                        local_id: {
                          id_type: 'Bytes',
                          sbor_hex: '5cc002206f4d519f1bbc994fd7399ebecb16de79a441d4a9fae9e85cb78801e787e69ad5',
                          simple_rep: '[6f4d519f1bbc994fd7399ebecb16de79a441d4a9fae9e85cb78801e787e69ad5]',
                        },
                        resource_address: 'resource_rdx1nfxxxxxxxxxxglcllrxxxxxxxxx002350006550xxxxxxxxxglcllr',
                      },
                    },
                  },
                },
              },
            },
            updater_roles: [
              {
                name: 'burner_updater',
                module: 'Main',
              },
            ],
          },
          {
            role_key: {
              name: 'minter',
              module: 'Main',
            },
            assignment: {
              resolution: 'Explicit',
              explicit_rule: {
                type: 'Protected',
                access_rule: {
                  type: 'ProofRule',
                  proof_rule: {
                    type: 'Require',
                    requirement: {
                      type: 'NonFungible',
                      non_fungible: {
                        local_id: {
                          id_type: 'Bytes',
                          sbor_hex: '5cc002206f4d519f1bbc994fd7399ebecb16de79a441d4a9fae9e85cb78801e787e69ad5',
                          simple_rep: '[6f4d519f1bbc994fd7399ebecb16de79a441d4a9fae9e85cb78801e787e69ad5]',
                        },
                        resource_address: 'resource_rdx1nfxxxxxxxxxxglcllrxxxxxxxxx002350006550xxxxxxxxxglcllr',
                      },
                    },
                  },
                },
              },
            },
            updater_roles: [
              {
                name: 'minter_updater',
                module: 'Main',
              },
            ],
          },
          {
            role_key: {
              name: 'freezer',
              module: 'Main',
            },
            assignment: {
              resolution: 'Explicit',
              explicit_rule: {
                type: 'DenyAll',
              },
            },
            updater_roles: [
              {
                name: 'freezer_updater',
                module: 'Main',
              },
            ],
          },
          {
            role_key: {
              name: 'recaller',
              module: 'Main',
            },
            assignment: {
              resolution: 'Explicit',
              explicit_rule: {
                type: 'DenyAll',
              },
            },
            updater_roles: [
              {
                name: 'recaller_updater',
                module: 'Main',
              },
            ],
          },
          {
            role_key: {
              name: 'depositor',
              module: 'Main',
            },
            assignment: {
              resolution: 'Explicit',
              explicit_rule: {
                type: 'AllowAll',
              },
            },
            updater_roles: [
              {
                name: 'depositor_updater',
                module: 'Main',
              },
            ],
          },
          {
            role_key: {
              name: 'withdrawer',
              module: 'Main',
            },
            assignment: {
              resolution: 'Explicit',
              explicit_rule: {
                type: 'AllowAll',
              },
            },
            updater_roles: [
              {
                name: 'withdrawer_updater',
                module: 'Main',
              },
            ],
          },
          {
            role_key: {
              name: 'burner_updater',
              module: 'Main',
            },
            assignment: {
              resolution: 'Explicit',
              explicit_rule: {
                type: 'DenyAll',
              },
            },
            updater_roles: [
              {
                name: 'burner_updater',
                module: 'Main',
              },
            ],
          },
          {
            role_key: {
              name: 'minter_updater',
              module: 'Main',
            },
            assignment: {
              resolution: 'Explicit',
              explicit_rule: {
                type: 'DenyAll',
              },
            },
            updater_roles: [
              {
                name: 'minter_updater',
                module: 'Main',
              },
            ],
          },
          {
            role_key: {
              name: 'freezer_updater',
              module: 'Main',
            },
            assignment: {
              resolution: 'Explicit',
              explicit_rule: {
                type: 'DenyAll',
              },
            },
            updater_roles: [
              {
                name: 'freezer_updater',
                module: 'Main',
              },
            ],
          },
          {
            role_key: {
              name: 'recaller_updater',
              module: 'Main',
            },
            assignment: {
              resolution: 'Explicit',
              explicit_rule: {
                type: 'DenyAll',
              },
            },
            updater_roles: [
              {
                name: 'recaller_updater',
                module: 'Main',
              },
            ],
          },
          {
            role_key: {
              name: 'depositor_updater',
              module: 'Main',
            },
            assignment: {
              resolution: 'Explicit',
              explicit_rule: {
                type: 'DenyAll',
              },
            },
            updater_roles: [
              {
                name: 'depositor_updater',
                module: 'Main',
              },
            ],
          },
          {
            role_key: {
              name: 'withdrawer_updater',
              module: 'Main',
            },
            assignment: {
              resolution: 'Explicit',
              explicit_rule: {
                type: 'DenyAll',
              },
            },
            updater_roles: [
              {
                name: 'withdrawer_updater',
                module: 'Main',
              },
            ],
          },
          {
            role_key: {
              name: 'metadata_locker',
              module: 'Metadata',
            },
            assignment: {
              resolution: 'Owner',
            },
            updater_roles: [
              {
                name: 'metadata_locker_updater',
                module: 'Metadata',
              },
            ],
          },
          {
            role_key: {
              name: 'metadata_locker_updater',
              module: 'Metadata',
            },
            assignment: {
              resolution: 'Owner',
            },
            updater_roles: [
              {
                name: 'metadata_locker_updater',
                module: 'Metadata',
              },
            ],
          },
          {
            role_key: {
              name: 'metadata_setter',
              module: 'Metadata',
            },
            assignment: {
              resolution: 'Owner',
            },
            updater_roles: [
              {
                name: 'metadata_setter_updater',
                module: 'Metadata',
              },
            ],
          },
          {
            role_key: {
              name: 'metadata_setter_updater',
              module: 'Metadata',
            },
            assignment: {
              resolution: 'Owner',
            },
            updater_roles: [
              {
                name: 'metadata_setter_updater',
                module: 'Metadata',
              },
            ],
          },
        ],
      },
      divisibility: 18,
      total_supply: '74548756.467659626333250862',
      total_minted: '89655544.615103837636251448',
      total_burned: '15106788.147444211303000586',
    },
  },
]

export const mockConstructionMetadataResponse = {
  ledger_state: {
    network: 'mainnet',
    state_version: 73433937,
    proposer_round_timestamp: '2024-04-19T19:12:29.607Z',
    epoch: 92167,
    round: 405,
  },
}

export const mockTransactionPreviewResponse = {
  encoded_receipt:
    '5c22000121062108a000743ba40b000000000000000000000000000000000000000900e1f5050900093d00a000743ba40b000000000000000000000000000000000000000980f0fa02a0aaaa829007e54be700000000000000000000000000000000a080cdc975bc56000000000000000000000000000000000000a080cdc975bc560000000000000000000000000000000000002102080000a0000000000000000000000000000000000000000000000000210709fdc83c0009b7a40f00a000a461f1bea1c30200000000000000000000000000000000a000eccf48041db60000000000000000000000000000000000a0000000000000000000000000000000000000000000000000a000ffa9083f47520200000000000000000000000000000000a00000000000000000000000000000000000000000000000002201012102230c09240b4166746572496e766f6b65400200000e416c6c6f636174654e6f64654964560800000c4265666f7265496e766f6b65b00a00000d436c6f73655375627374617465269400000a4372656174654e6f64650e4b00000844726f704e6f6465157a000009456d69744576656e742c0b0000074c6f636b466565f4010000174d61726b537562737461746541735472616e7369656e74370000000a4d6f76654d6f64756c65780500002b4f70656e53756273746174653a3a476c6f62616c46756e6769626c655265736f757263654d616e61676572e7ac02002e4f70656e53756273746174653a3a476c6f62616c4e6f6e46756e6769626c655265736f757263654d616e61676572bea600001b4f70656e53756273746174653a3a476c6f62616c5061636b616765430e1f00294f70656e53756273746174653a3a476c6f62616c5669727475616c456432353531394163636f756e74c2c90b00234f70656e53756273746174653a3a496e7465726e616c46756e6769626c655661756c7494790100264f70656e53756273746174653a3a496e7465726e616c47656e65726963436f6d706f6e656e7427df00000750696e4e6f6465f00000000a51756572794163746f72c40900000c526561645375627374617465015b02001b52756e4e6174697665436f64653a3a576f726b746f705f64726f70fe4500001a52756e4e6174697665436f64653a3a576f726b746f705f707574697100001b52756e4e6174697665436f64653a3a576f726b746f705f74616b652e4600001552756e4e6174697665436f64653a3a637265617465106000003952756e4e6174697665436f64653a3a6372656174655f656d7074795f7661756c745f46756e6769626c655265736f757263654d616e61676572f28a00001f52756e4e6174697665436f64653a3a6372656174655f776974685f646174614f6b00002852756e4e6174697665436f64653a3a6765745f616d6f756e745f46756e6769626c654275636b6574188100001752756e4e6174697665436f64653a3a6c6f636b5f666565bbb000002452756e4e6174697665436f64653a3a6c6f636b5f6665655f616e645f7769746864726177687101001c52756e4e6174697665436f64653a3a6f6e5f7669727475616c697a65d88600002052756e4e6174697665436f64653a3a7075745f46756e6769626c655661756c74ea5f00002152756e4e6174697665436f64653a3a74616b655f46756e6769626c655661756c74d9a500002352756e4e6174697665436f64653a3a7472795f6465706f7369745f6f725f61626f7274c47e01000b5365745375627374617465730100001156616c696461746554785061796c6f6164103600001256657269667954785369676e617475726573000000000d5772697465537562737461746582230000230c09040c436f6d6d69744576656e7473d56100000a436f6d6d69744c6f6773000000002f436f6d6d69745374617465557064617465733a3a476c6f62616c5669727475616c456432353531394163636f756e74d3ae0a0029436f6d6d69745374617465557064617465733a3a496e7465726e616c46756e6769626c655661756c740f940400220001210921012320220e071e860c6318c6318c6c4e1b40cc6318c6318cf7bca52eb54a6a86318c6318c6000123072201400001232222010001070200012007635c220001210222000121022307a002048096bab5ad5f2d0c0000000000000000000000000000000003c0e3b69080017301000000000000000000000000000000009058619833de031de3aad69cad02a22656e083e307fb617b28e1b275bd7ed7220000071e82cc6318c6318c659963ed8c6318c6318cf7e8f5ae8f4a96a6318c6318c6000123072202400001232222010001070000012007265c220001210222000121050a35e90000000000000759074107ff0a64000000000000002200005a00012322220101012007245c200720fa2dbd1f01147560c0652746d9c275dde9a340fef46bd71104c11b7f1ddfc60600012007125c2200012102220101220001220000220000071e0d906318c6318c659a6130cc6318c6318cf7a8ba5295eabf46318c6318c6000123072206440001232222004200012322220041000123222200010001232222004500012322220046000123222200071e5155d545fc40d2d01750b5d055631ddc6fa6b1f6779fec707b167ef6955800012307220400000123222200060001232222000500012322220041000123222200071e0d906318c6318c6ee313598c6318c6318cf7bcaa2e954a9626318c6318c60001230722084400012322220000000123222200430001232222004200012322220041000123222200010001232222004500012322220046000123222200071e5da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6000123072203000001232222000600012322220040000123222200071e58ab589162d80e402c7f061b3216f721395f0d117a80b98749cf0e6dad8b00012307220200000123222200400001232222010001070000012007255c2200012102220001a0007100c8040d34061e020000000000000000000000000000220000071e0d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c600012307220744000123222200000001232222004200012322220041000123222200010001232222004500012322220046000123222200071e515d2ea24237d6d7e3e3882a2f5c0175318f3b372ac70ae4b68892e0065a00012307220702000123222202010120070e5c0c0b6f776e65725f626164676500012007335c2200012102220101220001220b01c0021e515d2ea24237d6d7e3e3882a2f5c0175318f3b372ac70ae4b68892e0065a220100010120070d5c0c0a6f776e65725f6b65797300012007375c2200012102220101220001228f01202201010120071d5d2ea24237d6d7e3e3882a2f5c0175318f3b372ac70ae4b68892e0065a2200000500012322220100010700000120075e5c220001210222000121022202012200012200012200012102809a4c6318c6318c6cb554820c6318c6318cf7a951d7a9e547c6318c6318c6c0021d5d2ea24237d6d7e3e3882a2f5c0175318f3b372ac70ae4b68892e0065a2202002200000600012322220101012007105c21022200000c087365637572696679000120075c5c22000121022201012200012202012200012200012200012102809a4c6318c6318c6cb554820c6318c6318cf7a951d7a9e547c6318c6318c6c0021d5d2ea24237d6d7e3e3882a2f5c0175318f3b372ac70ae4b68892e0065a220000400001232222010001070000012007115c22000121022200012101220000220000000001232222010001070000012007775c220001210221052102800d906318c6318c6ee313598c6318c6318cf7bcaa2e954a9626318c6318c60c074163636f756e742103090100000009000000000900000000220100200c0020220022000123222102030003090100000009000000000900000000010003090100000009000000000900000000420001232222004100012322220101012007205c805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6000120072e5c220001210222010122000190584248f074b6541d6ba33fb1631336a0d9ffea35f701576fb6719cff0a0b220000071e0d906318c6318c6e8f9fcc0c6318c6318cf7aa2fad74a29e26318c6318c600012307220744000123222200000001232222004200012322220041000123222200010001232222004500012322220046000123222200071e9a4c6318c6318c6cb554820c6318c6318cf7a951d7a9e547c6318c6318c600012307220100000123222200071e0d906318c6318c6dadbd5f4c6318c6318cf7d155d53de568a6318c6318c600012307220744000123222200000001232222004200012322220041000123222200010001232222004500012322220046000123222200071e584248f074b6541d6ba33fb1631336a0d9ffea35f701576fb6719cff0a0b000123072203000001232222010001070000012007745c220001210221052102800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c60c0d46756e6769626c655661756c742103090100000009000000000900000000220001805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6200c0020220022010001000123222200400001232222010001070000012007255c2200012102220001a0000064a7b3b6e00d00000000000000000000000000000000220000071e58619833de031de3aad69cad02a22656e083e307fb617b28e1b275bd7ed7000123072201400001232222010001070000012007255c2200012102220001a0efd58ede5cc2401b000000000000000000000000000000002200002105208000208001515d2ea24237d6d7e3e3882a2f5c0175318f3b372ac70ae4b68892e0065a208000208001584248f074b6541d6ba33fb1631336a0d9ffea35f701576fb6719cff0a0b23202103071e58ab589162d80e402c7f061b3216f721395f0d117a80b98749cf0e6dad8b02805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6220001a00071c0154a4353ecffffffffffffffffffffffffffffffff071e584248f074b6541d6ba33fb1631336a0d9ffea35f701576fb6719cff0a0b02805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6220001a0000064a7b3b6e00d00000000000000000000000000000000071e58619833de031de3aad69cad02a22656e083e307fb617b28e1b275bd7ed702805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6220001a080c76d210103e6020000000000000000000000000000000021012320a001071e58ab589162d80e402c7f061b3216f721395f0d117a80b98749cf0e6dad8b008fdb420206cc05000000000000000000000000000000002104a0c0e3b6908001730100000000000000000000000000000000a0c0e3b6908001730100000000000000000000000000000000a080c76d210103e602000000000000000000000000000000002322a00022000120220300012007205c90f8eb2e0a4c8712448bb6225171d75a3aef40eec287ebd98c1618305cefc9010000012007035c210020210802210222010220071e58ab589162d80e402c7f061b3216f721395f0d117a80b98749cf0e6dad8b2200000c0c4c6f636b4665654576656e7420071c5c2101a00000f444829163450000000000000000000000000000000002210222010220071e58ab589162d80e402c7f061b3216f721395f0d117a80b98749cf0e6dad8b2200000c0d57697468647261774576656e7420071c5c2101a0000064a7b3b6e00d0000000000000000000000000000000002210222010220071e5da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c62200000c125661756c744372656174696f6e4576656e742007245c210120071e584248f074b6541d6ba33fb1631336a0d9ffea35f701576fb6719cff0a0b02210222010220071e584248f074b6541d6ba33fb1631336a0d9ffea35f701576fb6719cff0a0b2200000c0c4465706f7369744576656e7420071c5c2101a0000064a7b3b6e00d0000000000000000000000000000000002210222010220071e515d2ea24237d6d7e3e3882a2f5c0175318f3b372ac70ae4b68892e0065a2200000c0c4465706f7369744576656e7420073c5c220002805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6a0000064a7b3b6e00d0000000000000000000000000000000002210222010220071e58ab589162d80e402c7f061b3216f721395f0d117a80b98749cf0e6dad8b2200000c0b5061794665654576656e7420071c5c2101a0008fdb420206cc050000000000000000000000000000000002210222010220071e58619833de031de3aad69cad02a22656e083e307fb617b28e1b275bd7ed72200000c0c4465706f7369744576656e7420071c5c2101a080c76d210103e6020000000000000000000000000000000002210222010220071e5da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c62200000c194275726e46756e6769626c655265736f757263654576656e7420071c5c2101a080c76d210103e60200000000000000000000000000000000202100210223202306071e860c6318c6318c6c4e1b40cc6318c6318cf7bca52eb54a6a86318c6318c607230140222201000107020301210122000121012103800d906318c6318c6c4e1b40cc6318c6318cf7bfd5d45f48c686318c6318c6200720d8510877df1d820f4752b3c033baf656f62e0e612731718865d048b9d16300b32201010a0900000000000000071e82cc6318c6318c659963ed8c6318c6318cf7e8f5ae8f4a96a6318c6318c607230240222201000107000301210122000121012103800d906318c6318c659963ed8c6318c6318cf7be85a17d48bca6318c6318c6200720bd71c021e525c608eaf7291c8c0eb2519993241a8e8d6d58c62e3ae0565355922201010a03000000000000005a22220101012007245c200720fa2dbd1f01147560c0652746d9c275dde9a340fef46bd71104c11b7f1ddfc6060401210222000121012103800d906318c6318c659963ed8c6318c6318cf7be85a17d48bca6318c6318c6200720bd71c021e525c608eaf7291c8c0eb2519993241a8e8d6d58c62e3ae0565355922201010a000000000000000022000121012103800d906318c6318c659963ed8c6318c6318cf7be85a17d48bca6318c6318c6200720bd71c021e525c608eaf7291c8c0eb2519993241a8e8d6d58c62e3ae0565355922201010a0100000000000000071e58ab589162d80e402c7f061b3216f721395f0d117a80b98749cf0e6dad8b07230140222201000107000301210122000121012103800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c6200720462a3fea283117aab2b01c297812bdc0fa9060b29eb5e68b847f361bc12019332201010a0000000000000000071e515d2ea24237d6d7e3e3882a2f5c0175318f3b372ac70ae4b68892e0065a07230602222202010120070e5c0c0b6f776e65725f62616467650401210222000121012103800d906318c6318c6dadbd5f4c6318c6318cf7d155d53de568a6318c6318c620072007bfe5891cd05394fa30c6a67fab9208642f39665ca903f9405aff6b6fefb36a220001070c22000121012103800d906318c6318c6dadbd5f4c6318c6318cf7d155d53de568a6318c6318c620072007bfe5891cd05394fa30c6a67fab9208642f39665ca903f9405aff6b6fefb36a2201010a0000000000000000010120070d5c0c0a6f776e65725f6b6579730401210222000121012103800d906318c6318c6dadbd5f4c6318c6318cf7d155d53de568a6318c6318c620072007bfe5891cd05394fa30c6a67fab9208642f39665ca903f9405aff6b6fefb36a220001070c22000121012103800d906318c6318c6dadbd5f4c6318c6318cf7d155d53de568a6318c6318c620072007bfe5891cd05394fa30c6a67fab9208642f39665ca903f9405aff6b6fefb36a2201010a000000000000000005222201000107000301210122000121012103800d906318c6318c6e8f9fcc0c6318c6318cf7aa2fad74a29e26318c6318c6200720a06c16caa26e2fbc01ba2b9fe564a3f02d8f426c4580fcafebdff5464fefbde82201010a00000000000000000622220101012007105c21022200000c0873656375726966790401210222000121012103800d906318c6318c6e8f9fcc0c6318c6318cf7aa2fad74a29e26318c6318c6200720a06c16caa26e2fbc01ba2b9fe564a3f02d8f426c4580fcafebdff5464fefbde82201010a030000000000000022000121012103800d906318c6318c6e8f9fcc0c6318c6318cf7aa2fad74a29e26318c6318c6200720a06c16caa26e2fbc01ba2b9fe564a3f02d8f426c4580fcafebdff5464fefbde82201010a040000000000000040222201000107000301210122000121012103800d906318c6318c6ee313598c6318c6318cf7bcaa2e954a9626318c6318c6200720a54510264dbd13e03ea7d6e3112d5f3a88c9bddae66b9569d5de381ba9447a8a2201010a00000000000000000022220100010700000121012200004122220101012007205c805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c60401210222000121012103800d906318c6318c6ee313598c6318c6318cf7bcaa2e954a9626318c6318c6200720a54510264dbd13e03ea7d6e3112d5f3a88c9bddae66b9569d5de381ba9447a8a220001078522000121012103800d906318c6318c6ee313598c6318c6318cf7bcaa2e954a9626318c6318c6200720a54510264dbd13e03ea7d6e3112d5f3a88c9bddae66b9569d5de381ba9447a8a2201010a0300000000000000071e584248f074b6541d6ba33fb1631336a0d9ffea35f701576fb6719cff0a0b07230200222201000107000001210122000040222201000107000301210122000121012103800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c6200720462a3fea283117aab2b01c297812bdc0fa9060b29eb5e68b847f361bc12019332201010a0000000000000000071e58619833de031de3aad69cad02a22656e083e307fb617b28e1b275bd7ed707230140222201000107000301210122000121012103800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c6200720462a3fea283117aab2b01c297812bdc0fa9060b29eb5e68b847f361bc12019332201010a0000000000000000232121080222010220071e58ab589162d80e402c7f061b3216f721395f0d117a80b98749cf0e6dad8b2200000c0c4c6f636b4665654576656e740121012103800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c6200720462a3fea283117aab2b01c297812bdc0fa9060b29eb5e68b847f361bc12019332201010a16000000000000000222010220071e58ab589162d80e402c7f061b3216f721395f0d117a80b98749cf0e6dad8b2200000c0d57697468647261774576656e740121012103800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c6200720462a3fea283117aab2b01c297812bdc0fa9060b29eb5e68b847f361bc12019332201010a18000000000000000222010220071e5da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c62200000c125661756c744372656174696f6e4576656e740121012103800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c6200720ba27cc155884d6e1aa7a41346fd8c11f18cc99775653caef1fd3455d625fd1472201010a37000000000000000222010220071e584248f074b6541d6ba33fb1631336a0d9ffea35f701576fb6719cff0a0b2200000c0c4465706f7369744576656e740121012103800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c6200720462a3fea283117aab2b01c297812bdc0fa9060b29eb5e68b847f361bc12019332201010a19000000000000000222010220071e515d2ea24237d6d7e3e3882a2f5c0175318f3b372ac70ae4b68892e0065a2200000c0c4465706f7369744576656e740121012103800d906318c6318c6ee313598c6318c6318cf7bcaa2e954a9626318c6318c6200720a54510264dbd13e03ea7d6e3112d5f3a88c9bddae66b9569d5de381ba9447a8a2201010a28000000000000000222010220071e58ab589162d80e402c7f061b3216f721395f0d117a80b98749cf0e6dad8b2200000c0b5061794665654576656e740121012103800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c6200720462a3fea283117aab2b01c297812bdc0fa9060b29eb5e68b847f361bc12019332201010a17000000000000000222010220071e58619833de031de3aad69cad02a22656e083e307fb617b28e1b275bd7ed72200000c0c4465706f7369744576656e740121012103800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c6200720462a3fea283117aab2b01c297812bdc0fa9060b29eb5e68b847f361bc12019332201010a19000000000000000222010220071e5da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c62200000c194275726e46756e6769626c655265736f757263654576656e740121012103800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c6200720ba27cc155884d6e1aa7a41346fd8c11f18cc99775653caef1fd3455d625fd1472201010a3a0000000000000022010121032021010822000121022102800d906318c6318c659a6130cc6318c6318cf7a8ba5295eabf46318c6318c60c145472616e73616374696f6e50726f636573736f720c0372756e0a00000000000000002201000a01000000000000000a000000000000000021022320220023202200210223202200232022002021040822010121022102800d906318c6318c6ee313598c6318c6318cf7bcaa2e954a9626318c6318c60c074163636f756e740c156c6f636b5f6665655f616e645f77697468647261770a010000000000000022000120071e5155d545fc40d2d01750b5d055631ddc6fa6b1f6779fec707b167ef695580a02000000000000000a000000000000000021022320220023202200210223202201071ef8eb2e0a4c8712448bb6225171d75a3aef40eec287ebd98c1618305cefc90002805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6a0000064a7b3b6e00d00000000000000000000000000000000232022002021010822010121022102800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c60c0d46756e6769626c655661756c740c0474616b650a020000000000000022000120071e58ab589162d80e402c7f061b3216f721395f0d117a80b98749cf0e6dad8b0a03000000000000000a000000000000000021022320220023202200210223202201071ef8eb2e0a4c8712448bb6225171d75a3aef40eec287ebd98c1618305cefc90002805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6a0000064a7b3b6e00d0000000000000000000000000000000023202200202101082202000a030000000000000022000120071e58ab589162d80e402c7f061b3216f721395f0d117a80b98749cf0e6dad8b0a03000000000000000a000000000000000021022320220023202200210223202201071ef8eb2e0a4c8712448bb6225171d75a3aef40eec287ebd98c1618305cefc90002805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6a0000064a7b3b6e00d00000000000000000000000000000000232022002021000822010121022102800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c60c07576f726b746f700c0b576f726b746f705f7075740a010000000000000022000120071ef8c904f9f2c33be0f62ae93c07e44cd8837270b1c24d8edc2e2fe492045a0a02000000000000000a0000000000000000210223202201071ef8eb2e0a4c8712448bb6225171d75a3aef40eec287ebd98c1618305cefc90002805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6a0000064a7b3b6e00d0000000000000000000000000000000023202200210223202200232022002021000822010121022102800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c60c07576f726b746f700c0c576f726b746f705f74616b650a010000000000000022000120071ef8c904f9f2c33be0f62ae93c07e44cd8837270b1c24d8edc2e2fe492045a0a02000000000000000a010000000000000021022320220023202200210223202201071ef8eb2e0a4c8712448bb6225171d75a3aef40eec287ebd98c1618305cefc90002805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6a0000064a7b3b6e00d00000000000000000000000000000000232022002021000822010121022102800d906318c6318c6ee313598c6318c6318cf7bcaa2e954a9626318c6318c60c074163636f756e740c147472795f6465706f7369745f6f725f61626f72740a010000000000000022000120071e515d2ea24237d6d7e3e3882a2f5c0175318f3b372ac70ae4b68892e0065a0a02000000000000000a0200000000000000210223202201071ef8eb2e0a4c8712448bb6225171d75a3aef40eec287ebd98c1618305cefc90002805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6a0000064a7b3b6e00d0000000000000000000000000000000023202200210223202200232022002021010822010121022102800d906318c6318c61e603c64c6318c6318cf7be913d63aafbc6318c6318c60c0d46756e6769626c655661756c740c037075740a020000000000000022000120071e584248f074b6541d6ba33fb1631336a0d9ffea35f701576fb6719cff0a0b0a03000000000000000a0200000000000000210223202201071ef8eb2e0a4c8712448bb6225171d75a3aef40eec287ebd98c1618305cefc90002805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6a0000064a7b3b6e00d000000000000000000000000000000002320220021022320220023202200202101082203000a030000000000000022000120071e584248f074b6541d6ba33fb1631336a0d9ffea35f701576fb6719cff0a0b0a03000000000000000a0200000000000000210223202201071ef8eb2e0a4c8712448bb6225171d75a3aef40eec287ebd98c1618305cefc90002805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6a0000064a7b3b6e00d000000000000000000000000000000002320220021022320220023202200202100230a2002000000000000000021010420071e5155d545fc40d2d01750b5d055631ddc6fa6b1f6779fec707b167ef6955820071e58ab589162d80e402c7f061b3216f721395f0d117a80b98749cf0e6dad8b805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6a00071c0154a4353ecffffffffffffffffffffffffffffffff020000000000000021010420071e515d2ea24237d6d7e3e3882a2f5c0175318f3b372ac70ae4b68892e0065a20071e584248f074b6541d6ba33fb1631336a0d9ffea35f701576fb6719cff0a0b805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6a0000064a7b3b6e00d000000000000000000000000000000002102a00000f4448291634500000000000000000000000000000000a0000000000000000000000000000000000000000000000000220000',
  receipt: {
    status: 'Succeeded',
    fee_summary: {
      execution_cost_units_consumed: 3983613,
      finalization_cost_units_consumed: 1025207,
      xrd_total_execution_cost: '0.19918065',
      xrd_total_finalization_cost: '0.05126035',
      xrd_total_royalty_cost: '0',
      xrd_total_storage_cost: '0.16727447222',
      xrd_total_tipping_cost: '0',
    },
    costing_parameters: {
      execution_cost_unit_price: '0.00000005',
      execution_cost_unit_limit: 100000000,
      execution_cost_unit_loan: 4000000,
      finalization_cost_unit_price: '0.00000005',
      finalization_cost_unit_limit: 50000000,
      xrd_usd_price: '16.666666666666666666',
      xrd_storage_price: '0.00009536743',
      xrd_archive_storage_price: '0.00009536743',
      tip_percentage: 0,
    },
    fee_source: { from_vaults: [Array] },
    fee_destination: {
      to_proposer: '0.104428868055',
      to_validator_set: '0.104428868055',
      to_burn: '0.20885773611',
      to_royalty_recipients: [],
    },
    state_updates: {
      deleted_partitions: [],
      created_substates: [Array],
      updated_substates: [Array],
      deleted_substates: [],
      new_global_entities: [Array],
    },
    events: [[Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object]],
    output: [[Object], [Object], [Object]],
  },
  resource_changes: [
    { index: 0, resource_changes: [Array] },
    { index: 2, resource_changes: [Array] },
  ],
  logs: [],
}

export const mockStreamTransactionsResponse = {
  items: [
    {
      transaction_status: 'CommittedSuccess',
      state_version: 74063493,
      epoch: 91839,
      round: 399,
      round_timestamp: '2024-04-21T12:22:23.287Z',
      payload_hash: 'notarizedtransaction_rdx1qzhzfcxpa24ctrm5m0u4jz497xgx99dvg3pq3epp65avmyses96sn6ngnl',
      intent_hash: 'txid_rdx130ph7c6yh3tj490m2wa80c4pc0pwu4uqng2939n4s5djwfnrv82s9lxdl5',
      fee_paid: '0.24701070443',
      confirmed_at: '2024-04-21T12:22:23.287Z',
      raw_hex:
        '4d22030221022104210707010abf660100000000000ac16601000000000009cfc5f1b7220001200721026805ad5730038d04038581fed06b922983767f96245d3243fbd231768d7c147b010108000020220441038000d1ce0e025788005689381fe27c5e661388df6c8a768c51eeac11591ad8ac0c086c6f636b5f666565210185000064a7b3b6e00d0000000000000000000000000000000041038000d1ce0e025788005689381fe27c5e661388df6c8a768c51eeac11591ad8ac0c087769746864726177210280005da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6858018674c568df8ec35000000000000000000000000000000000280005da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6858018674c568df8ec3500000000000000000000000000000041038000d1aa50c20c34dbc1789d7bf60f201e3c71140a9054478c76bae7a4d957300c147472795f6465706f7369745f6f725f61626f727421028100000000220000202000220000202200220001210120074101465049ed291ca6d49b25fb23df45797e290a6414ff6ef1b50d5b50fde75ac31b50751b5b0b207bb1d662905411827f1ae7aee2b8bfbd73c980e0e94ec41ac548',
      receipt: { status: 'CommittedSuccess' },
      manifest_classes: ['Transfer', 'General'],
    },
    {
      transaction_status: 'CommittedSuccess',
      state_version: 74050862,
      epoch: 91830,
      round: 1288,
      round_timestamp: '2024-04-21T11:40:15.33Z',
      payload_hash: 'notarizedtransaction_rdx1mcs24datkgzzwr8klzdknufynw4cnlgkuk40hy90gaz2kjpn29msr9ejmg',
      intent_hash: 'txid_rdx184a2q0r62f4p0gccxrmr5l7dgxrxhzclktkkyqvc4vgm09vv4c6s846z43',
      fee_paid: '0.24701070443',
      confirmed_at: '2024-04-21T11:40:15.33Z',
      raw_hex:
        '4d22030221022104210707010ab6660100000000000ab86601000000000009d5cbd63922000120072103f3f44c9e80e2cedc1a2909631a3adea8866ee32187f74d0912387359b0ff36a2010108000020220441038000d128c72bfd5e093f5d5fcf250c3d7754b930a0d3ea4cfe8077c8ea47783b0c086c6f636b5f6665652101850000b2d3595bf0060000000000000000000000000000000041038000d128c72bfd5e093f5d5fcf250c3d7754b930a0d3ea4cfe8077c8ea47783b0c087769746864726177210280005da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6850000ec0a63eedb56bb000000000000000000000000000000000280005da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6850000ec0a63eedb56bb00000000000000000000000000000041038000d1c243a3cdd773bba9e79fd30c0a18dfcc993f12a680e9d1e71d64b026230c147472795f6465706f7369745f6f725f61626f7274210281000000002200002020002200002022002200012101200741017267e82ba51eb1a322b0c465f0e68a99dabab2e95cf4e311f1a729422f23ad873499f7d1cef2290cfb1254cfd833a1a7f18c1849c4079e080ad7bb341af3b052',
      receipt: { status: 'CommittedSuccess' },
      manifest_classes: ['Transfer', 'General'],
    },
    {
      transaction_status: 'CommittedSuccess',
      state_version: 74053117,
      epoch: 91832,
      round: 519,
      round_timestamp: '2024-04-21T11:47:52.86Z',
      payload_hash: 'notarizedtransaction_rdx16jeqrkwtv6ud3y304s7hfh3l8uurs4fytc4dhmfqjp0xhhvs3kaq5wqlec',
      intent_hash: 'txid_rdx1h560eswverreymruspk4gdrvg9c6r9wf02aj27w8pm0cqqcana6q2h7ee4',
      fee_paid: '0.24701070443',
      confirmed_at: '2024-04-21T11:47:52.86Z',
      raw_hex:
        '4d22030221022104210707010ab8660100000000000aba66010000000000093d3a26e822000120072103d382278438b567787da799287d0f6d19b98a625865b4e7087cd9cfd0df5d0d67010108000020220441038000d10733f38978d8675de08974f801ef7ff57d8203284d740086f2bbfb09b40c086c6f636b5f666565210185000064a7b3b6e00d0000000000000000000000000000000041038000d10733f38978d8675de08974f801ef7ff57d8203284d740086f2bbfb09b40c087769746864726177210280005da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6858018dbf54db21d6672040000000000000000000000000000000280005da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6858018dbf54db21d667204000000000000000000000000000041038000d1aa50c20c34dbc1789d7bf60f201e3c71140a9054478c76bae7a4d957300c147472795f6465706f7369745f6f725f61626f727421028100000000220000202000220000202200220001210120074101528579bd740cd0dfa8cd23f5cf2f5670b917b54389b813fda53eb080b9c83ae3529d7e9441cab8bbb4b89ec9c4a3dde054260b241eeff640457b379201255a38',
      receipt: { status: 'CommittedSuccess' },
      manifest_classes: ['Transfer', 'General'],
    },
  ],
}

export const submitTransactionResponse = { duplicate: false }
