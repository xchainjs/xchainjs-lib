# Security Policy

## Reporting a vulnerability

Do **not** open a public GitHub issue for an undisclosed vulnerability in this
repository or in a published `@xchainjs/*` package.

Use GitHub's private advisory form:

https://github.com/xchainjs/xchainjs-lib/security/advisories/new

If that page is unavailable, ask in the maintainers' Telegram
([t.me/xchainjs](https://t.me/xchainjs)) for a private contact — do not paste
proof-of-concept details in a public channel.

Please include:

- Affected package and version (from `yarn.lock` / npm, not a range)
- Impact (key leakage, theft of funds, network mix-up, RPC confusion, …)
- Reproduction steps or a patch

## Scope notes

`@xchainjs/xchain-monero` derives spend/view keys from a BIP-39 mnemonic and can
pass those keys to a local `monero-wallet-rpc`. Treat it as experimental. Do not
use it with mainnet funds until a maintainer has confirmed a stagenet spend
against `monerod`.
