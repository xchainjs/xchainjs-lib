---
'@xchainjs/xchain-aggregator': minor
---

Allow custom THORNode/Midgard (and MAYANode/Maya Midgard) base URLs for the Thorchain and Mayachain protocols.

The aggregator previously hardcoded the THORChain and MAYAChain clients with only the network, so it always talked to the public default endpoints. Consumers can now pass optional `thornodeConfig`, `midgardConfig`, `mayanodeConfig` and `mayaMidgardConfig` fields (the existing `ThornodeConfig` / `MidgardConfig` / `MayanodeConfig` shapes from the query packages) via the aggregator config. These are forwarded to the underlying `Thornode`, `Midgard`, `Mayanode` and `MidgardApi` clients so integrators can point at their own gateway/proxy.

Fully backward compatible: when the new fields are omitted, behaviour is unchanged and the per-network default endpoints are used.
