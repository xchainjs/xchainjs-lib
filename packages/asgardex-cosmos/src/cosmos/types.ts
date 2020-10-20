import { Asset } from '@thorchain/asgardex-util'

// This needs to be updated asgardex-util does not support COSMOS
export const CosmosChain = 'THOR'
export const AssetAtom: Asset = { chain: CosmosChain, symbol: 'ATOM', ticker: 'ATOM' }
export const AssetMuon: Asset = { chain: CosmosChain, symbol: 'MUON', ticker: 'MUON' }
