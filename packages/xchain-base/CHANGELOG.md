# Changelog

## 1.0.14

### Patch Changes

- Updated dependencies [3ea213e]
  - @xchainjs/xchain-client@2.0.10
  - @xchainjs/xchain-evm@2.0.14
  - @xchainjs/xchain-evm-providers@2.0.13

## 1.0.13

### Patch Changes

- Updated dependencies [cb963d7]
  - @xchainjs/xchain-evm-providers@2.0.12
  - @xchainjs/xchain-evm@2.0.13

## 1.0.12

### Patch Changes

- 63ec81f: Fix ESM (ECMAScript Module) compatibility issues

  - Update bignumber.js to 9.1.2 for proper ESM support
  - Change bitcore-lib-cash imports from namespace to default imports for ESM compatibility
  - Change @dashevo/dashcore-lib imports from namespace to default imports for ESM compatibility
  - Add .js extensions to coinselect/accumulative imports for ESM
  - Add .js extensions to cosmjs-types imports for ESM
  - Update module type declarations for ESM compatibility
  - Regenerate protobuf files with correct ESM import patterns

  This enables the library to work properly in ESM environments (Node.js type: "module", modern bundlers, etc.)

- Updated dependencies [b1c99c8]
- Updated dependencies [63ec81f]
  - @xchainjs/xchain-client@2.0.9
  - @xchainjs/xchain-evm@2.0.12
  - @xchainjs/xchain-util@2.0.5
  - @xchainjs/xchain-evm-providers@2.0.11

## 1.0.11

### Patch Changes

- @xchainjs/xchain-client@2.0.8
- @xchainjs/xchain-evm@2.0.11
- @xchainjs/xchain-evm-providers@2.0.10

## 1.0.10

### Patch Changes

- @xchainjs/xchain-client@2.0.7
- @xchainjs/xchain-evm@2.0.10
- @xchainjs/xchain-evm-providers@2.0.9

## 1.0.9

### Patch Changes

- 59a4a07: Fix vulnerability form-data
- Updated dependencies [59a4a07]
  - @xchainjs/xchain-client@2.0.6
  - @xchainjs/xchain-evm@2.0.9
  - @xchainjs/xchain-evm-providers@2.0.8
  - @xchainjs/xchain-util@2.0.4

## 1.0.8

### Patch Changes

- Updated dependencies [ba9247b]
  - @xchainjs/xchain-evm-providers@2.0.7
  - @xchainjs/xchain-client@2.0.5
  - @xchainjs/xchain-evm@2.0.8

## 1.0.7

### Patch Changes

- 4ff6d9a: updates and jest config changes
- 2a9674b: fix typescript config
- Updated dependencies [c612862]
- Updated dependencies [4ff6d9a]
- Updated dependencies [2a9674b]
  - @xchainjs/xchain-evm-providers@2.0.6
  - @xchainjs/xchain-evm@2.0.7
  - @xchainjs/xchain-client@2.0.4
  - @xchainjs/xchain-util@2.0.3

## 1.0.6

### Patch Changes

- Updated dependencies [4012c06]
  - @xchainjs/xchain-util@2.0.2
  - @xchainjs/xchain-client@2.0.3
  - @xchainjs/xchain-evm@2.0.6
  - @xchainjs/xchain-evm-providers@2.0.5

## 1.0.5

### Patch Changes

- Updated dependencies [8c58393]
  - @xchainjs/xchain-evm@2.0.5

## 1.0.4

### Patch Changes

- Updated dependencies [5c90c64]
  - @xchainjs/xchain-evm-providers@2.0.4
  - @xchainjs/xchain-evm@2.0.4

## 1.0.3

### Patch Changes

- 9370688: More dependency updates
- Updated dependencies [0479f1b]
- Updated dependencies [9370688]
  - @xchainjs/xchain-evm@2.0.3
  - @xchainjs/xchain-evm-providers@2.0.3
  - @xchainjs/xchain-util@2.0.1
  - @xchainjs/xchain-client@2.0.2

## 1.0.2

### Patch Changes

- Updated dependencies [6b03221]
- Updated dependencies [842920f]
  - @xchainjs/xchain-client@2.0.1
  - @xchainjs/xchain-evm-providers@2.0.2
  - @xchainjs/xchain-evm@2.0.2

## 1.0.1

### Patch Changes

- 89585ee: Support etherscan v2
- Updated dependencies [89585ee]
  - @xchainjs/xchain-evm-providers@2.0.1
  - @xchainjs/xchain-evm@2.0.1

## 1.0.0

### Major Changes

- 621a7a0: Major optimization

### Patch Changes

- Updated dependencies [621a7a0]
  - @xchainjs/xchain-evm-providers@2.0.0
  - @xchainjs/xchain-client@2.0.0
  - @xchainjs/xchain-util@2.0.0
  - @xchainjs/xchain-evm@2.0.0

## 0.0.10

### Patch Changes

- Updated dependencies [590c8eb]
- Updated dependencies [590c8eb]
  - @xchainjs/xchain-util@1.0.8
  - @xchainjs/xchain-client@1.0.10
  - @xchainjs/xchain-evm@1.0.14
  - @xchainjs/xchain-evm-providers@1.0.12

## 0.0.9

### Patch Changes

- Updated dependencies [f45246f]
  - @xchainjs/xchain-util@1.0.7
  - @xchainjs/xchain-client@1.0.9
  - @xchainjs/xchain-evm@1.0.13
  - @xchainjs/xchain-evm-providers@1.0.11

## 0.0.8

### Patch Changes

- @xchainjs/xchain-client@1.0.8
- @xchainjs/xchain-evm@1.0.12
- @xchainjs/xchain-evm-providers@1.0.10

## 0.0.7

### Patch Changes

- 0cf33cf: Rollup configuration. Interop option set to 'auto' for CommoJS output
- Updated dependencies [0cf33cf]
  - @xchainjs/xchain-evm-providers@1.0.9
  - @xchainjs/xchain-client@1.0.7
  - @xchainjs/xchain-util@1.0.6
  - @xchainjs/xchain-evm@1.0.11

## 0.0.6

### Patch Changes

- 33bfa40: Rollup update to latest version.
- Updated dependencies [33bfa40]
  - @xchainjs/xchain-evm-providers@1.0.8
  - @xchainjs/xchain-client@1.0.6
  - @xchainjs/xchain-util@1.0.5
  - @xchainjs/xchain-evm@1.0.10

## 0.0.5

### Patch Changes

- Updated dependencies [73b68ed]
  - @xchainjs/xchain-util@1.0.4
  - @xchainjs/xchain-client@1.0.5
  - @xchainjs/xchain-evm@1.0.9
  - @xchainjs/xchain-evm-providers@1.0.7

## 0.0.4

### Patch Changes

- Updated dependencies [f90c0d8]
  - @xchainjs/xchain-util@1.0.3
  - @xchainjs/xchain-client@1.0.4
  - @xchainjs/xchain-evm@1.0.8
  - @xchainjs/xchain-evm-providers@1.0.6

## 0.0.3

### Patch Changes

- Updated dependencies [c303f02]
  - @xchainjs/xchain-evm-providers@1.0.5
  - @xchainjs/xchain-evm@1.0.7

## 0.0.2

### Patch Changes

- Updated dependencies [b4327b9]
- Updated dependencies [b4327b9]
  - @xchainjs/xchain-evm-providers@1.0.4
  - @xchainjs/xchain-evm@1.0.6

## 0.0.1

### Patch Changes

- 374c464: Add base package
- Updated dependencies [dec3ba3]
  - @xchainjs/xchain-util@1.0.2
  - @xchainjs/xchain-client@1.0.3
  - @xchainjs/xchain-evm@1.0.5
  - @xchainjs/xchain-evm-providers@1.0.3
