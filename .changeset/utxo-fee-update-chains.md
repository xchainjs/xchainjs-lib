---
'@xchainjs/xchain-bitcoin': minor
'@xchainjs/xchain-litecoin': minor
'@xchainjs/xchain-bitcoincash': minor
'@xchainjs/xchain-doge': minor
'@xchainjs/xchain-dash': minor
---

Fees now follow the real transaction size. Each client supplies sizes for its address format (BTC P2WPKH, P2TR, P2SH-P2WPKH and P2PKH, LTC, BCH, DOGE, DASH), and the estimate, the selector fee and the paid fee are the same number. Memos of any length are sized exactly. Change at or below the chain's dust (LTC 5460, DOGE 1,000,000, DASH 5460, others 546) is added to the fee instead of creating a dust change output.

Fee estimates now match the real size. Over known UTXOs, BTC P2SH-P2WPKH rises 26 vB per input, BTC P2TR drops 18 vB per input, BTC P2PKH rises from 67 to 148 bytes per input, and the other chains change by a few bytes. Input-less estimates rise most, because they assume one input: to 141 vB (P2WPKH), 155 (P2TR), 166 (P2SH-P2WPKH) and 226 bytes (P2PKH-family). Estimates drop where the old `MIN_TX_FEE` floors applied (BTC, LTC, DOGE and DASH; `MIN_TX_FEE` stays exported and deprecated), for BTC P2TR (18 vB per input), and by 1 byte per input on DOGE. The estimate models a send with change over all UTXOs, with the recipient output sized like the sender's format; for a MAX send, subtract one output times the rate. A larger recipient type (for example P2WSH or P2TR from a P2WPKH sender) can make the actual send up to 12 vB times the rate higher than the estimate; the send never pays below the requested rate. BCH, DOGE and DASH price every recipient output as P2PKH (34 bytes), so a P2SH recipient overpays by 2 bytes times the rate. BCH, DOGE and BTC P2PKH sends (and DASH MAX) now pay the requested rate; before, they paid roughly 46 to 62 percent of it, falling as inputs grow. DASH sends previously paid dashcore's flat fee (1000 duff per started kB), regardless of the requested rate. BTC and LTC P2WPKH sends no longer pay slightly under the rate when a memo or a larger recipient output is present.

DASH builds the recipient, change and memo outputs from the selection, so the transaction pays the selector fee. It no longer lets dashcore choose the change, and it serialises with `disableLargeFees` only. Change uses dashcore's 5460 dust, so change at or below it is absorbed into the fee. Its `compileMemo` returns a Buffer.

Ledger `transfer` on LTC, BCH, DOGE and DASH now uses `prepareTxEnhanced` and accepts `utxoSelectionPreferences` and `selectedUtxos` (BTC Ledger `transfer` gains `selectedUtxos`). Output order becomes recipient, change, memo, parameters are validated, errors are `UtxoError`, and the fee rate is rounded up instead of `toFixed(0)`. Verify one Ledger send per chain on a device before release.
