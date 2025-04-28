# Changelog

## 2.0.0

### Major Changes

- 621a7a0: Major optimization

### Patch Changes

- Updated dependencies [621a7a0]
  - @xchainjs/xchain-mayamidgard-query@1.0.0
  - @xchainjs/xchain-mayamidgard@1.0.0
  - @xchainjs/xchain-mayanode@1.0.0
  - @xchainjs/xchain-client@2.0.0
  - @xchainjs/xchain-util@2.0.0

## 1.0.12

### Patch Changes

- Updated dependencies [6c30cb9]
  - @xchainjs/xchain-mayamidgard-query@0.1.27

## 1.0.11

### Patch Changes

- Updated dependencies [590c8eb]
- Updated dependencies [590c8eb]
  - @xchainjs/xchain-util@1.0.8
  - @xchainjs/xchain-client@1.0.10
  - @xchainjs/xchain-mayamidgard-query@0.1.26

## 1.0.10

### Patch Changes

- Updated dependencies [6ceedf7]
- Updated dependencies [f45246f]
  - @xchainjs/xchain-mayanode@0.1.12
  - @xchainjs/xchain-util@1.0.7
  - @xchainjs/xchain-client@1.0.9
  - @xchainjs/xchain-mayamidgard-query@0.1.25

## 1.0.9

### Patch Changes

- @xchainjs/xchain-client@1.0.8
- @xchainjs/xchain-mayamidgard-query@0.1.24

## 1.0.8

### Patch Changes

- 0cf33cf: Rollup configuration. Interop option set to 'auto' for CommoJS output
- Updated dependencies [0cf33cf]
  - @xchainjs/xchain-mayamidgard-query@0.1.23
  - @xchainjs/xchain-mayamidgard@0.1.8
  - @xchainjs/xchain-mayanode@0.1.11
  - @xchainjs/xchain-client@1.0.7
  - @xchainjs/xchain-util@1.0.6

## 1.0.7

### Patch Changes

- cf78958: Swap history bug fix.
- 33bfa40: Rollup update to latest version.
- Updated dependencies [33bfa40]
  - @xchainjs/xchain-mayamidgard-query@0.1.22
  - @xchainjs/xchain-mayamidgard@0.1.7
  - @xchainjs/xchain-mayanode@0.1.10
  - @xchainjs/xchain-client@1.0.6
  - @xchainjs/xchain-util@1.0.5

## 1.0.6

### Patch Changes

- 73b68ed: Bug fix with duplicated swaps from Midgard
- 73b68ed: `SwapResume` type with new `fromAsset` and `toAsset` properties
- Updated dependencies [73b68ed]
  - @xchainjs/xchain-util@1.0.4
  - @xchainjs/xchain-client@1.0.5
  - @xchainjs/xchain-mayamidgard-query@0.1.21

## 1.0.5

### Patch Changes

- Updated dependencies [f90c0d8]
  - @xchainjs/xchain-util@1.0.3
  - @xchainjs/xchain-client@1.0.4
  - @xchainjs/xchain-mayamidgard-query@0.1.20

## 1.0.4

### Patch Changes

- ccde096: Method `getDustValues` updated to be compatible with Radix.

## 1.0.3

### Patch Changes

- Updated dependencies [dec3ba3]
  - @xchainjs/xchain-util@1.0.2
  - @xchainjs/xchain-client@1.0.3
  - @xchainjs/xchain-mayamidgard-query@0.1.19

## 1.0.2

### Patch Changes

- Updated dependencies [b07b69a]
  - @xchainjs/xchain-util@1.0.1
  - @xchainjs/xchain-client@1.0.2
  - @xchainjs/xchain-mayamidgard-query@0.1.18

## 1.0.1

### Patch Changes

- 837e3e7: Axios version update to v1.7.4
- Updated dependencies [837e3e7]
- Updated dependencies [323cbea]
  - @xchainjs/xchain-mayamidgard-query@0.1.17
  - @xchainjs/xchain-mayamidgard@0.1.6
  - @xchainjs/xchain-mayanode@0.1.9
  - @xchainjs/xchain-client@1.0.1

## 1.0.0

### Major Changes

- c74614f: Methods and types updated with `Asset` type refactored.

### Patch Changes

- c74614f: `QuoteSwap` type updated. `Fees` type with `liquidityFee` and `totalFee` parameters.
- c74614f: Streaming swap parameters for `quoteSwap` method.
- Updated dependencies [c74614f]
  - @xchainjs/xchain-util@1.0.0
  - @xchainjs/xchain-client@1.0.0
  - @xchainjs/xchain-mayamidgard-query@0.1.16

## 0.1.21

### Patch Changes

- f54dcd2: `QuoteSwap` type updated. `Fees` type with `liquidityFee` and `totalFee` parameters.
- f54dcd2: Streaming swap parameters for `quoteSwap` method.

## 0.1.20

### Patch Changes

- f086da3: `quoteSwap` method updated. New parameters `streamingInterval` and `streamingQuantity` for streaming swaps
- Updated dependencies [f086da3]
- Updated dependencies [f086da3]
  - @xchainjs/xchain-mayanode@0.1.8
  - @xchainjs/xchain-mayamidgard@0.1.5
  - @xchainjs/xchain-mayamidgard-query@0.1.15

## 0.1.19

### Patch Changes

- 52498ec: `getMAYANameDetails` method response type updated. `expire` parameter replaced by `expireBlockHeight` and `entries` replaced by `alias`.
- 52498ec: New method `estimateMAYAName` to estimate the cost of the update or the registration of a MAYAName

## 0.1.18

### Patch Changes

- cd327ab: New method `getMAYANamesByOwner` to retrieve the MAYANames owned by an address

## 0.1.17

### Patch Changes

- Updated dependencies [99825cb]
- Updated dependencies [6fe2b21]
  - @xchainjs/xchain-mayanode@0.1.7
  - @xchainjs/xchain-util@0.13.7
  - @xchainjs/xchain-client@0.16.8
  - @xchainjs/xchain-mayamidgard-query@0.1.14

## 0.1.16

### Patch Changes

- 662085f: `Swap` type updated, `outboundTx` property is now optional
- 662085f: Outbound transaction bug fix in `getSwapHistory` method.

## 0.1.15

### Patch Changes

- Updated dependencies [8d000a2]
  - @xchainjs/xchain-client@0.16.7
  - @xchainjs/xchain-mayamidgard-query@0.1.13

## 0.1.14

### Patch Changes

- 15181f4: Release fix
- Updated dependencies [15181f4]
  - @xchainjs/xchain-client@0.16.6
  - @xchainjs/xchain-mayamidgard@0.1.4
  - @xchainjs/xchain-mayamidgard-query@0.1.12
  - @xchainjs/xchain-mayanode@0.1.6
  - @xchainjs/xchain-util@0.13.6

## 0.1.13

### Patch Changes

- 582d682: Internal dependencies updated to use workspace nomenclature
- Updated dependencies [582d682]
  - @xchainjs/xchain-mayamidgard-query@0.1.11
  - @xchainjs/xchain-mayamidgard@0.1.3
  - @xchainjs/xchain-mayanode@0.1.5
  - @xchainjs/xchain-client@0.16.5
  - @xchainjs/xchain-util@0.13.5

## 0.1.12

### Patch Changes

- b93add9: Dependecies as external at building process
- Updated dependencies [b93add9]
  - @xchainjs/xchain-mayamidgard-query@0.1.10
  - @xchainjs/xchain-mayamidgard@0.1.2
  - @xchainjs/xchain-mayanode@0.1.4
  - @xchainjs/xchain-client@0.16.4
  - @xchainjs/xchain-util@0.13.4

## 0.1.11

### Patch Changes

- Updated dependencies [448c29f]
  - @xchainjs/xchain-client@0.16.3
  - @xchainjs/xchain-mayamidgard-query@0.1.9

## 0.1.10

### Patch Changes

- ecacc18: Add chain ARB to getDustValues
- e0d9669: Node API backup endpoint
- Updated dependencies [e0d9669]
  - @xchainjs/xchain-mayamidgard-query@0.1.8

## 0.1.9

### Patch Changes

- c4bd96a: New method `getSwapHistory`
- c4bd96a: New method `getPools`
- c4bd96a: Bug fix with Cacao decimals
- Updated dependencies [c4bd96a]
  - @xchainjs/xchain-mayamidgard-query@0.1.7

## 0.1.8

### Patch Changes

- Updated dependencies [c71952d]
  - @xchainjs/xchain-util@0.13.3
  - @xchainjs/xchain-client@0.16.2
  - @xchainjs/xchain-mayamidgard-query@0.1.6

## 0.1.7

### Patch Changes

- 0f92b8c: Get asset decimals method

## 0.1.6

### Patch Changes

- 9229e99: Update apis to the latest specs
- Updated dependencies [9229e99]
  - @xchainjs/xchain-mayanode@0.1.3
  - @xchainjs/xchain-mayamidgard-query@0.1.5

## 0.1.5

### Patch Changes

- @xchainjs/xchain-client@0.16.1
- @xchainjs/xchain-mayamidgard-query@0.1.4

## v0.1.4 (2023-12-12)

### Update

- Client dependency increased to 0.16.0
- Maya midgard query dependency increased to 0.1.3

## v0.1.3 (2023-12-11)

### Update

- Client dependency updated

## v0.1.2 (2023-12-11)

### Update

- Client dependency increased

## v0.1.1 (2023-12-06)

### Update

- Decimals bug fix with Cacao in quote swap
- Bug fix in getChainInboundDetails fixed

## v0.1.0-alpha (2023-08-03)

### Module Created
