import { getRandomOuts, getUnspentOuts, submitRawTx } from './api'

export function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(`Expected 'val' to be defined, but received ${val}`)
  }
}

/**
 * callback functions for sending transfers, used by haven-core-client.ts
 */

export const updateStatus = (status: any) => {
  console.log(status)
}

export const getRandomOutsReq = (reqParams: any, cb: (err: any, res: any) => void) => {
  getRandomOuts(reqParams)
    .then((res) => cb(null, res))
    .catch((err) => cb(err, null))
}

export const getUnspentOutsReq = (reqParams: any, cb: (err: any, res: any) => void) => {
  getUnspentOuts(reqParams)
    .then((res) => cb(null, res))
    .catch((err) => cb(err, null))
}

export const submitRawTxReq = (reqParams: any, cb: (err: any, res: any) => void) => {
  submitRawTx(reqParams)
    .then((res) => cb(null, res))
    .catch((err) => cb(err, null))
}
