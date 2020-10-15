import { Asset } from '@thorchain/asgardex-util'

// This needs to be updated asgardex-util does not support COSMOS
export declare const CosmosChain = "THOR";
export const AssetAtom: Asset = { chain: CosmosChain, symbol: 'uatom', ticker: 'uatom' };
export const AssetMuon: Asset = { chain: CosmosChain, symbol: 'umuon', ticker: 'umuon' };
