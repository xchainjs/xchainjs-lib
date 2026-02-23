export function writeCompactInt(value: number): Buffer {
  if (value < 0xfd) {
    return Buffer.from([value])
  } else if (value <= 0xffff) {
    // 0xFD followed by 16-bit integer
    const buffer = Buffer.alloc(3)
    buffer[0] = 0xfd
    buffer.writeUInt16LE(value, 1)
    return buffer
  } else if (value <= 0xffffffff) {
    // 0xFE followed by 32-bit integer
    const buffer = Buffer.alloc(5)
    buffer[0] = 0xfe
    buffer.writeUInt32LE(value, 1)
    return buffer
  } else {
    // 0xFF followed by 64-bit integer
    const buffer = Buffer.alloc(9)
    buffer[0] = 0xff
    const bigValue = BigInt(value)
    buffer.writeBigUInt64LE(bigValue, 1)
    return buffer
  }
}

export function pushData(length: number): Buffer {
  const buf = Buffer.alloc(2)
  let offset = 0
  if (length < 0x4c) {
    buf[0] = length
    offset += 1
  } else {
    buf[0] = 0x4c
    buf[1] = length
    offset += 2
  }
  return buf.subarray(0, offset)
}
