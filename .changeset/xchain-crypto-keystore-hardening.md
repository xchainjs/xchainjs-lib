---
'@xchainjs/xchain-crypto': patch
---

Harden keystore encryption. The PBKDF2 iteration count for newly created keystores is raised from 262,144 to 600,000 (the current OWASP minimum for PBKDF2-HMAC-SHA256). The count is stored inside each keystore, so existing keystores continue to decrypt unchanged. The keystore MAC check now uses a constant-time comparison (`crypto.timingSafeEqual`) instead of a plain string comparison, removing a minor timing side channel during password verification.
