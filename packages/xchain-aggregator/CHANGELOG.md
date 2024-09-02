# Changelog

## 1.0.4

### Patch Changes

- b07b69a: Support auto-approval for ERC-20 tokens
- Updated dependencies [b07b69a]
- Updated dependencies [b07b69a]
- Updated dependencies [b07b69a]
  - @xchainjs/xchain-wallet@1.0.4
  - @xchainjs/xchain-mayachain-amm@3.0.4
  - @xchainjs/xchain-thorchain-amm@2.0.4
  - @xchainjs/xchain-util@1.0.1
  - @xchainjs/xchain-client@1.0.2
  - @xchainjs/xchain-mayachain@2.0.2
  - @xchainjs/xchain-mayachain-query@1.0.2
  - @xchainjs/xchain-thorchain@2.0.2
  - @xchainjs/xchain-thorchain-query@1.0.2

## 1.0.3

### Patch Changes

- @xchainjs/xchain-thorchain-amm@2.0.3
- @xchainjs/xchain-wallet@1.0.3
- @xchainjs/xchain-mayachain-amm@3.0.3

## 1.0.2

### Patch Changes

- @xchainjs/xchain-thorchain-amm@2.0.2
- @xchainjs/xchain-wallet@1.0.2
- @xchainjs/xchain-mayachain-amm@3.0.2

## 1.0.1

### Patch Changes

- 837e3e7: Axios version update to v1.7.4
- Updated dependencies [837e3e7]
- Updated dependencies [323cbea]
- Updated dependencies [be1c45f]
  - @xchainjs/xchain-mayachain-query@1.0.1
  - @xchainjs/xchain-thorchain-query@1.0.1
  - @xchainjs/xchain-mayachain-amm@3.0.1
  - @xchainjs/xchain-thorchain-amm@2.0.1
  - @xchainjs/xchain-mayachain@2.0.1
  - @xchainjs/xchain-thorchain@2.0.1
  - @xchainjs/xchain-client@1.0.1
  - @xchainjs/xchain-wallet@1.0.1

## 1.0.0

### Major Changes

- c74614f: Methods and types updated with `Asset` type refactored.

### Patch Changes

- bece78b: Trade assets support for swaps. Currently supported by Thorchain.
  - @xchainjs/xchain-util@1.0.0
  - @xchainjs/xchain-thorchain-query@1.0.0
  - @xchainjs/xchain-thorchain-amm@2.0.0
  - @xchainjs/xchain-mayachain@2.0.0
  - @xchainjs/xchain-thorchain@2.0.0
  - @xchainjs/xchain-wallet@1.0.0
  - @xchainjs/xchain-client@1.0.0
  - @xchainjs/xchain-mayachain-amm@3.0.0
  - @xchainjs/xchain-mayachain-query@1.0.0

## 0.2.6

### Patch Changes

- Updated dependencies [f54dcd2]
- Updated dependencies [f54dcd2]
- Updated dependencies [f54dcd2]
  - @xchainjs/xchain-mayachain-amm@2.0.14
  - @xchainjs/xchain-mayachain-query@0.1.21

## 0.2.5

### Patch Changes

- Updated dependencies [f086da3]
  - @xchainjs/xchain-mayachain-query@0.1.20
  - @xchainjs/xchain-thorchain-query@0.7.17
  - @xchainjs/xchain-mayachain-amm@2.0.13
  - @xchainjs/xchain-thorchain-amm@1.1.18

## 0.2.4

### Patch Changes

- Updated dependencies [7df3870]
- Updated dependencies [52498ec]
- Updated dependencies [7df3870]
- Updated dependencies [7df3870]
- Updated dependencies [7df3870]
- Updated dependencies [7df3870]
- Updated dependencies [7df3870]
- Updated dependencies [52498ec]
- Updated dependencies [7df3870]
- Updated dependencies [7df3870]
- Updated dependencies [7df3870]
  - @xchainjs/xchain-thorchain-amm@1.1.17
  - @xchainjs/xchain-mayachain-query@0.1.19
  - @xchainjs/xchain-mayachain-amm@2.0.12
  - @xchainjs/xchain-thorchain-query@0.7.16

## 0.2.3

### Patch Changes

- d9de5e2: Affiliate bug fix in `doSwap` function

## 0.2.2

### Patch Changes

- b45c0c8: New method `getConfiguration` to retrieve the current Aggregator configuration
- b45c0c8: New method `setConfiguration` to update the Aggregator configuration
- b45c0c8: Aggregator config. You can now disable protocols to work with through the Aggregator.
- b45c0c8: Quote swap affiliate params removed for `estimateSwap` and `doSwap` methods. Aggregator use the configuration set by the user for the Aggregator to automatically use affiliates with each protocol
- Updated dependencies [cd327ab]
- Updated dependencies [b45c0c8]
- Updated dependencies [e81d6be]
- Updated dependencies [cd327ab]
- Updated dependencies [e81d6be]
  - @xchainjs/xchain-mayachain-query@0.1.18
  - @xchainjs/xchain-mayachain-amm@2.0.11
  - @xchainjs/xchain-thorchain-amm@1.1.16

## 0.2.1

### Patch Changes

- Updated dependencies [6fe2b21]
  - @xchainjs/xchain-util@0.13.7
  - @xchainjs/xchain-mayachain-query@0.1.17
  - @xchainjs/xchain-thorchain-query@0.7.15
  - @xchainjs/xchain-client@0.16.8
  - @xchainjs/xchain-mayachain@1.0.11
  - @xchainjs/xchain-thorchain@1.1.1
  - @xchainjs/xchain-thorchain-amm@1.1.15
  - @xchainjs/xchain-wallet@0.1.19
  - @xchainjs/xchain-mayachain-amm@2.0.10

## 0.2.0

### Minor Changes

- 45e9238: Chainflip protocol support

### Patch Changes

- 662085f: `SwapResume` type updated, `outboundTx` property is now optional
- Updated dependencies [662085f]
- Updated dependencies [662085f]
- Updated dependencies [9d4c162]
  - @xchainjs/xchain-mayachain-query@0.1.16
  - @xchainjs/xchain-thorchain-query@0.7.14
  - @xchainjs/xchain-mayachain@1.0.10
  - @xchainjs/xchain-mayachain-amm@2.0.9
  - @xchainjs/xchain-thorchain-amm@1.1.14
  - @xchainjs/xchain-wallet@0.1.18

## 0.1.19

### Patch Changes

- Updated dependencies [3863979]
- Updated dependencies [f29a7ad]
- Updated dependencies [a9fd322]
  - @xchainjs/xchain-wallet@0.1.17
  - @xchainjs/xchain-thorchain@1.1.0
  - @xchainjs/xchain-mayachain@1.0.9
  - @xchainjs/xchain-mayachain-amm@2.0.8
  - @xchainjs/xchain-thorchain-amm@1.1.13

## 0.1.18

### Patch Changes

- @xchainjs/xchain-mayachain@1.0.8
- @xchainjs/xchain-thorchain@1.0.11
- @xchainjs/xchain-thorchain-amm@1.1.12
- @xchainjs/xchain-mayachain-amm@2.0.7
- @xchainjs/xchain-wallet@0.1.16

## 0.1.17

### Patch Changes

- @xchainjs/xchain-thorchain-amm@1.1.11
- @xchainjs/xchain-wallet@0.1.15
- @xchainjs/xchain-mayachain-amm@2.0.6

## 0.1.16

### Patch Changes

- Updated dependencies [8d000a2]
  - @xchainjs/xchain-client@0.16.7
  - @xchainjs/xchain-mayachain@1.0.7
  - @xchainjs/xchain-mayachain-amm@2.0.5
  - @xchainjs/xchain-mayachain-query@0.1.15
  - @xchainjs/xchain-thorchain@1.0.10
  - @xchainjs/xchain-thorchain-amm@1.1.10
  - @xchainjs/xchain-thorchain-query@0.7.13
  - @xchainjs/xchain-wallet@0.1.14

## 0.1.15

### Patch Changes

- 15181f4: Release fix
- Updated dependencies [15181f4]
  - @xchainjs/xchain-client@0.16.6
  - @xchainjs/xchain-mayachain@1.0.6
  - @xchainjs/xchain-mayachain-amm@2.0.4
  - @xchainjs/xchain-mayachain-query@0.1.14
  - @xchainjs/xchain-thorchain@1.0.9
  - @xchainjs/xchain-thorchain-amm@1.1.9
  - @xchainjs/xchain-thorchain-query@0.7.12
  - @xchainjs/xchain-util@0.13.6
  - @xchainjs/xchain-wallet@0.1.13

## 0.1.14

### Patch Changes

- 582d682: Internal dependencies updated to use workspace nomenclature
- Updated dependencies [dd3b45d]
- Updated dependencies [3ed8127]
- Updated dependencies [582d682]
- Updated dependencies [54ba9c2]
  - @xchainjs/xchain-mayachain@1.0.5
  - @xchainjs/xchain-mayachain-amm@2.0.3
  - @xchainjs/xchain-thorchain-amm@1.1.8
  - @xchainjs/xchain-mayachain-query@0.1.13
  - @xchainjs/xchain-thorchain-query@0.7.11
  - @xchainjs/xchain-thorchain@1.0.8
  - @xchainjs/xchain-client@0.16.5
  - @xchainjs/xchain-wallet@0.1.12
  - @xchainjs/xchain-util@0.13.5

## 0.1.13

### Patch Changes

- @xchainjs/xchain-thorchain-amm@1.1.7

## 0.1.12

### Patch Changes

- Updated dependencies [b379aeb]
  - @xchainjs/xchain-mayachain@1.0.4
  - @xchainjs/xchain-thorchain@1.0.7
  - @xchainjs/xchain-mayachain-amm@2.0.2
  - @xchainjs/xchain-wallet@0.1.11
  - @xchainjs/xchain-thorchain-amm@1.1.6

## 0.1.11

### Patch Changes

- 7544bbe: Preferbuiltins and browser for resolve plugin

## 0.1.10

### Patch Changes

- b93add9: Dependecies as external at building process
- Updated dependencies [b93add9]
  - @xchainjs/xchain-mayachain-query@0.1.12
  - @xchainjs/xchain-thorchain-query@0.7.10
  - @xchainjs/xchain-mayachain-amm@2.0.1
  - @xchainjs/xchain-thorchain-amm@1.1.5
  - @xchainjs/xchain-mayachain@1.0.3
  - @xchainjs/xchain-thorchain@1.0.6
  - @xchainjs/xchain-client@0.16.4
  - @xchainjs/xchain-wallet@0.1.10
  - @xchainjs/xchain-util@0.13.4

## 0.1.9

### Patch Changes

- Updated dependencies [448c29f]
- Updated dependencies [448c29f]
- Updated dependencies [448c29f]
- Updated dependencies [448c29f]
- Updated dependencies [448c29f]
- Updated dependencies [f432295]
  - @xchainjs/xchain-mayachain-amm@2.0.0
  - @xchainjs/xchain-thorchain-amm@1.1.4
  - @xchainjs/xchain-wallet@0.1.9
  - @xchainjs/xchain-client@0.16.3
  - @xchainjs/xchain-mayachain@1.0.2
  - @xchainjs/xchain-mayachain-query@0.1.11
  - @xchainjs/xchain-thorchain@1.0.5
  - @xchainjs/xchain-thorchain-query@0.7.9

## 0.1.8

### Patch Changes

- Updated dependencies [ecacc18]
- Updated dependencies [e0d9669]
  - @xchainjs/xchain-mayachain-query@0.1.10
  - @xchainjs/xchain-mayachain-amm@1.1.2

## 0.1.7

### Patch Changes

- @xchainjs/xchain-thorchain-amm@1.1.3
- @xchainjs/xchain-mayachain-amm@1.1.1

## 0.1.6

### Patch Changes

- Updated dependencies [f130ee3]
  - @xchainjs/xchain-thorchain-amm@1.1.2

## 0.1.5

### Patch Changes

- @xchainjs/xchain-thorchain-amm@1.1.1
- @xchainjs/xchain-thorchain-query@0.7.8

## 0.1.4

### Patch Changes

- 512bdf6: Get swap history bug fix. Get swap history parameters updated from an array of `Address` to an array of `{ chain: Chain, address: Address}`

## 0.1.3

### Patch Changes

- 599c34e: Build production mode without sourcemaps and with minification. Build tool updated from Rollup to Tsup
- Updated dependencies [0944dcc]
- Updated dependencies [b2e198f]
- Updated dependencies [502ceca]
  - @xchainjs/xchain-mayachain-amm@1.1.0
  - @xchainjs/xchain-thorchain-amm@1.1.0

## 0.1.2

### Patch Changes

- 85fada5: Build bug fix
