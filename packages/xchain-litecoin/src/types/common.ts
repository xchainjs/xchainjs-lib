export type Witness = {
  value: number
  script: Buffer
}

export type NodeAuth = {
  username: string
  password: string
}

export type BroadcastTxParams = {
  txHex: string
  nodeUrl: string
  auth?: NodeAuth
}
