---
'@xchainjs/xchain-crypto': patch
---

Fix `decryptFromKeystore` throwing `TypeError: crypto.timingSafeEqual is not a function` in browser/bundler environments. The MAC comparison now falls back to a manual constant-time comparison when Node's `crypto.timingSafeEqual` is unavailable (e.g. under `crypto-browserify`), preserving timing-attack hardening on Node while restoring browser/Electron-renderer compatibility.
