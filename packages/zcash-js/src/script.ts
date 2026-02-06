import bs58check from 'bs58check'

import { pushData } from './writer'

export function memoToScript(memo: string): Buffer {
  const opr = Buffer.alloc(memo.length + 4)
  opr[1] = 0x6a
  let offset = 2
  const pml = pushData(memo.length)
  pml.copy(opr, offset)
  offset += pml.length
  Buffer.from(memo).copy(opr, offset)
  offset += memo.length
  opr[0] = offset - 1
  const script = opr.subarray(0, offset)
  return script
}

export function addressToScript(address: string): Buffer {
  const addrb = bs58check.decode(address)
  const pkh = Buffer.alloc(20)
  Buffer.from(addrb).copy(pkh, 0, 2)
  const script = Buffer.alloc(26)
  Buffer.from('1976a914', 'hex').copy(script)
  Buffer.from(pkh).copy(script, 4)
  Buffer.from('88ac', 'hex').copy(script, 24)
  return script
}

export function writeSigScript(signature: Uint8Array, pk: Uint8Array): Buffer {
  const buf = Buffer.alloc(5 + signature.length + pk.length)
  let offset = 0
  const psl = pushData(signature.length + 1)
  psl.copy(buf, offset)
  offset += psl.length
  Buffer.from(signature).copy(buf, offset)
  offset += signature.length
  buf[offset] = 1
  offset += 1
  const pkl = pushData(pk.length)
  pkl.copy(buf, offset)
  offset += pkl.length
  Buffer.from(pk).copy(buf, offset)
  offset += pk.length
  return buf.subarray(0, offset)
}
