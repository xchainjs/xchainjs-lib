# Changelog

## 1.2.2

### Patch Changes

- b06756d: Change the default `THORNODE_API_URL` from `https://thornode.thorchain.network/` to `https://gateway.liquify.com/chain/thorchain_api`.

## 1.2.1

### Patch Changes

- 51569ce: Bump direct `axios` dependency from 1.15.2 to 1.16.1 across all packages that declare it. Also bumps `lodash` from `^4.18.0` to `4.18.1` in `@xchainjs/zcash-js`. This propagates the security fixes from the earlier yarn-resolutions PR to actual consumers of the published packages — root resolutions only affect builds within this repo, not what downstream installers receive. Closes axios prototype-pollution / NO_PROXY-bypass / SSRF / CRLF / DoS advisories (GHSA-\* covering versions <1.16.1) and the lodash code-injection-via-template advisory for the affected published packages.

## 1.2.0

### Minor Changes

- d81f5a1: Update THORNode API spec from 3.15.0 to 3.16.3

### Patch Changes

- 70acc68: Bump axios from 1.15.0 to 1.15.2 to patch high-severity advisories: GHSA-pmwg-cvhr-8vh7 (NO_PROXY loopback bypass), GHSA-q8qp-cvcw-x6jj (HTTP adapter prototype pollution), GHSA-pf86-5x62-jrwf (response/request prototype pollution gadgets), and GHSA-6chq-wfr3-2hj9 (header injection via prototype pollution).

  Bump protobufjs from 6.11.4 to 7.5.5 in `@xchainjs/xchain-cosmos`, `@xchainjs/xchain-mayachain`, and `@xchainjs/xchain-thorchain` to patch GHSA-xq3m-2v4x-88gg (critical: arbitrary code execution).

- 5f92a68: Point THORChain endpoint defaults at the new official public gateway hosted at `*.thorchain.network` (announced in xchainjs/xchainjs-lib#1665). Mainnet defaults now use `https://thornode.thorchain.network`, `https://midgard.thorchain.network`, and `https://rpc.thorchain.network` as the primary URLs, with the existing Liquify gateway (`gateway.liquify.com`) retained as a fallback in packages that support multiple base URLs (`xchain-thorchain`, `xchain-thorchain-query`, `xchain-midgard-query`). The single-URL constants in `xchain-thornode` (`THORNODE_API_URL`) and `xchain-midgard` (`MIDGARD_API_URL`) are switched to the new gateway, as is the `MAINNET_THORNODE_API_BASE` used by `BaseXChainClient.thornodeAPIGet` in `xchain-client`. Consumers that pass their own URLs are unaffected.

## 1.1.1

### Patch Changes

- 0246a01: Update axios 1.13.5 → 1.15.0 to fix critical SSRF and header injection vulnerabilities. Update lodash to ^4.18.0 in zcash-js to fix code injection via \_.template. Update bignumber.js ^10.0.1 → ^11.0.0.
- c4682c4: Migrate Nine Realms endpoints to Liquify and updated providers

  - Mainnet thornode/midgard/rpc endpoints now use gateway.liquify.com
  - Haskoin endpoint updated to api.haskoin.com
  - Tracker URL updated to track.thorchain.org
  - New THORNODE_API_URL and MIDGARD_API_URL exports (old 9R names deprecated)
  - x-client-id header middleware expanded to match liquify.com
  - Stagenet defaults cleared (no Liquify stagenet yet)
  - Testnet entries marked as deprecated

## 1.1.0

### Minor Changes

- 773e77f: Regenerate API clients from latest OpenAPI specs: thornode 3.5.1→3.15.0, mayanode 1.123.0→1.128.0, midgard 2.29.3→2.34.0, mayamidgard 2.10.0→2.16.0.

  BREAKING: THORNode 3.15.0 removed loan and saver quote endpoints. `estimateAddSaver`, `estimateWithdrawSaver`, `getLoanQuoteOpen`, and `getLoanQuoteClose` now throw descriptive errors.

  MAYAChain query updated to populate new `preferredAsset` and `affiliateCollectorCacao` fields on MAYANameDetails.

## 1.0.6

### Patch Changes

- 3ea213e: Upgrade axios to 1.13.5 to fix security vulnerability (GHSA-43fc-jf86-j433)

## 1.0.5

### Patch Changes

- 59a4a07: Fix vulnerability form-data

## 1.0.4

### Patch Changes

- ba9247b: use a semver version range for dependencies

## 1.0.3

### Patch Changes

- 2a9674b: fix typescript config

## 1.0.2

### Patch Changes

- 0479f1b: Update dependencies
- 9370688: More dependency updates

## 1.0.1

### Patch Changes

- 561e2a4: Pass new parameter to quoteswap liquidityToleranceBps

## 1.0.0

### Major Changes

- 621a7a0: Major optimization

## 0.3.22

### Patch Changes

- 6ceedf7: Updated to the latest api spec

## 0.3.21

### Patch Changes

- 0cf33cf: Rollup configuration. Interop option set to 'auto' for CommoJS output

## 0.3.20

### Patch Changes

- 33bfa40: Rollup update to latest version.

## 0.3.19

### Patch Changes

- 837e3e7: Axios version update to v1.7.4

## 0.3.18

### Patch Changes

- 20a1f7c: Client aligned with Thornode v1.134.0

## 0.3.17

### Patch Changes

- 7d70a1c: Client aligned with Thornode v1.133.0

## 0.3.16

### Patch Changes

- 99825cb: Updated generated api files to the latest spec

## 0.3.15

### Patch Changes

- 15181f4: Release fix

## 0.3.14

### Patch Changes

- 582d682: Internal dependencies updated to use workspace nomenclature

## 0.3.13

### Patch Changes

- b93add9: Dependecies as external at building process

## 0.3.12

### Patch Changes

- b1dcd60: Update thornode and Midgard to the latest api specs

## 0.3.11

### Patch Changes

- aa127f8: Thornode client updated to v1.128.1

## 0.3.10

### Patch Changes

- 9229e99: Update apis to the latest specs

## v0.3.9 (2023-11-14)

### Update

- Updated thornode api spec to the latest 1.124.0

## v0.3.8 (2023-10-19)

### Update

- Update THORnode to the lastest api spec 1.122.0

## v0.3.7 (2023-10-06)

### Update

- Update THORnode to the lastest api spec 1.121.0

## v0.3.6 (2023-09-11)

### Update

- updated thornode to the latest 1.120.1

## v0.3.5 (2023-08-25)

### Update

- update thornode to the latest THORNode 1.118.0

## v0.3.4 (2023-07-26)

### Update

- Update thornode to the latest THORNode 1.116.0

## v0.3.3 (2023-06-21)

### Update

- Update thornode to the latest THORNode 1.113.1

## v0.3.2 (2023-05-25)

### Update

- Update to latest THORNode 1.110.0

## v0.3.0 (2023-05-08)

### Update

- Update to latest THORNode 1.109.0

## v0.3.0 (2023-05-02)

### Update

- update rollup config and axios to the latest
- update rimraf and openapitools

## v0.2.3 (2023-04-23)

### Breaking Change

- Update to latest THORNode 1.108.3

## v0.2.2 (2023-04-05)

### Breaking Change

- Update to latest THORNode 1.107.0

## v0.2.1 (2023-02-28)

### Breaking Change

- Update to latest THORNode 1.105.0

## v0.2.0 (2022-12-28)

### Breaking Change

- Update to latest THORNode 1.102.0, which has several backwards incompatible changes

## v0.1.5 (2022-12-13)

### Update

- remove support custom headers

## v0.1.4 (2022-12-08)

### Update

- Update to latest THORNode 1.101.0

## v0.1.3 (2022-12-07)

### Update

- Update to latest THORNode 1.100.0
- support custom headers
- set default 'x-client-id' in all calls

## v0.1.2 (2022-11-11)

### Update

- Update to latest THORNode 1.99.0

## v0.1.1 (2022-10-24)

### Update

- Update to latest THORNode 1.98.0

## v0.0.1.0 (2022-10-04)

### Update

- Update to latest THORNode 1.97.2

## v0.0.1.0-alpha4 (2022-08-20)

### Update

- Update to latest THORNode 1.95.0
- Generate files from `*.yaml` (to avoid extra step of convertion to `*.json`)
- Remove `yamljs`

## v0.0.1.0-alpha3 (2022-07-21)

???

## v0.0.1.0-alpha2 (2022-07-7)

### Fix

- Fix `OutboundProcess and ScheduledOutbound` exported interfaces, by preprocessing yaml->json (https://github.com/OpenAPITools/openapi-generator/issues/1593)

## v0.0.1.0-alpha (2022-07-4)

### Module Created
