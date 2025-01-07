import { Asset, SecuredAsset, SynthAsset, TokenAsset } from '@xchainjs/xchain-util'

export type CompatibleAsset = Asset | TokenAsset | SynthAsset | SecuredAsset
