# Changelog

## 0.5.5

### Patch Changes

- Updated dependencies [540326d]
  - @xchainjs/xchain-evm@0.6.3

## 0.5.4

### Patch Changes

- Updated dependencies [8d000a2]
  - @xchainjs/xchain-client@0.16.7
  - @xchainjs/xchain-evm@0.6.2
  - @xchainjs/xchain-evm-providers@0.1.12

## 0.5.3

### Patch Changes

- 15181f4: Release fix
- Updated dependencies [15181f4]
  - @xchainjs/xchain-client@0.16.6
  - @xchainjs/xchain-evm@0.6.1
  - @xchainjs/xchain-evm-providers@0.1.11
  - @xchainjs/xchain-util@0.13.6

## 0.5.2

### Patch Changes

- 582d682: Internal dependencies updated to use workspace nomenclature
- Updated dependencies [3ed8127]
- Updated dependencies [582d682]
- Updated dependencies [3ed8127]
  - @xchainjs/xchain-evm@0.6.0
  - @xchainjs/xchain-evm-providers@0.1.10
  - @xchainjs/xchain-client@0.16.5
  - @xchainjs/xchain-util@0.13.5

## 0.5.1

### Patch Changes

- b93add9: Dependecies as external at building process
- Updated dependencies [b93add9]
  - @xchainjs/xchain-evm-providers@0.1.9
  - @xchainjs/xchain-client@0.16.4
  - @xchainjs/xchain-util@0.13.4
  - @xchainjs/xchain-evm@0.5.1

## 0.5.0

### Minor Changes

- f432295: `signer` parameter removed from `transfer` function for the keystore client
- f432295: Ledger client
- f432295: `signer` parameter removed from `approve` function for the keystore client

### Patch Changes

- Updated dependencies [f432295]
- Updated dependencies [448c29f]
- Updated dependencies [448c29f]
- Updated dependencies [f432295]
  - @xchainjs/xchain-evm@0.5.0
  - @xchainjs/xchain-client@0.16.3
  - @xchainjs/xchain-evm-providers@0.1.8

## 0.4.7

### Patch Changes

- Updated dependencies [c71952d]
  - @xchainjs/xchain-util@0.13.3
  - @xchainjs/xchain-client@0.16.2
  - @xchainjs/xchain-evm@0.4.5
  - @xchainjs/xchain-evm-providers@0.1.7

## 0.4.6

### Patch Changes

- Updated dependencies [7f7f543]
  - @xchainjs/xchain-crypto@0.3.1
  - @xchainjs/xchain-client@0.16.1
  - @xchainjs/xchain-evm@0.4.4
  - @xchainjs/xchain-evm-providers@0.1.6

## 0.4.5

### Patch Changes

- 29008d7: Mainnet network set as default network

# v0.4.4 (2023-12-12)

## Update

- Client dependency increased to 0.16.0
- Evm client dependency increased to 0.4.3
- Evm providers dependency increased to 0.1.5

# v0.4.3 (2023-12-11)

## Update

- Client and EVM client packages update

# v0.4.2 (2023-11-21)

## Update

- BSCCHAIN_API_KEY renamed to BSCSCAN_API_KEY

# v0.4.1 (2023-11-16)

## Update

- Created method getAddressAsync

# v0.4.0 (2023-11-15)

## Update

- Default gasPrice in baseAmount unit. Changed from GWei to Wei

# v0.3.7 (2023-11-10)

## Update

- Etherscan provider compatible with Routescan

# v0.3.6 (2023-11-09)

## Update

- Transfer bug fix with txSigner, sender address can be retrieved from signer

# v0.3.5 (2023-11-03)

## Update

- EIP1559 params

# v0.3.4 (2023-11-02)

## Update

- Estimations can be done with data provider

# v0.3.3 (2023-10-26)

## Update

- Refactor transfer method to use prepareTx

# v0.3.2 (2023-09-14)

## Update

- bump xchain-evm dep

# v0.3.1 (2023-09-11)

## Update

- Bumped dependencies for util

# v0.3.0 (2023-08-10)

## Update

- add support for fallback on providers
- Update to use `xchain-evm-providers`

# v0.2.3 (2023-07-10)

## Update

- added process.env[apikey] config as default option to provider creation

# v0.2.2 (2023-05-18)

## Update

- Update client & evm dependencies

# v0.2.1 (2023-05-09)

## Update

- update ethers dependency

# v0.2.0 (2023-05-02)

## Update

- update rollup config and axios to the latest

# v.0.1.3 (2023-04-05)

## Add

- bump xchain-client deps

# v.0.1.2 (2023-03-21)

## Update

- Update explorer provider import

# v.0.1.1 (2023-03-18)

## Fix

- Type of `BSCChain`

# v.0.1.0 (2023-01-03)

## Update

- initial release
