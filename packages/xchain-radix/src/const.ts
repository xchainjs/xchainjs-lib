import { NetworkId } from '@radixdlt/radix-engine-toolkit'
import { Network, RootDerivationPaths } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'

/**
 * Chain identifier for Radix.
 * This constant represents the identifier for the Radix Chain.
 */
export const RadixChain = 'XRD' as const

export const MAINNET_GATEWAY_URL = 'https://mainnet.radixdlt.com'
export const STOKENET_GATEWAY_URL = 'https://stokenet.radixdlt.com'

export const XRD_DECIMAL = 18

export const RADIX_ASSET_RESOURCE = 'resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc'

export const AssetXRD: Asset = {
  symbol: `XRD`,
  ticker: 'XRD',
  type: AssetType.NATIVE,
  chain: RadixChain,
}

export const xrdRootDerivationPaths: RootDerivationPaths = {
  [Network.Mainnet]: "m/44'/1022'/1'/525'/1460'",
  [Network.Stagenet]: "m/44'/1022'/2'/525'/1460'",
  [Network.Testnet]: "m/44'/1022'/2'/525'/1460'",
}

export const bech32Networks: { [key: number]: string } = {
  1: 'rdx',
  2: 'tdx',
  3: 'tdx',
}

export const bech32Lengths: { [key: number]: number } = {
  1: 66,
  2: 69,
  3: 69,
}

interface FeesEstimationParams {
  from: string
  to: string
  resourceAddress: string
  publicKey: string
}

export const feesEstimationPublicKeys: { [networkId: number]: FeesEstimationParams } = {
  [NetworkId.Mainnet]: {
    from: 'account_rdx12xh48d5s9u7me5t49z25lrm4h73wclqpjvumd49ctf0ggnyazc62m8',
    to: 'account_rdx1685t40mreptjhs9g3pg9lgf7k7rgppzjeknjgrpc7d0sumcjrsw6kj',
    resourceAddress: RADIX_ASSET_RESOURCE,
    publicKey: 'a47e22f21e16d80374f16d66224b56f6eda82a6db8279de267a74a49f0291e8b',
  },
  [NetworkId.Stokenet]: {
    from: 'account_tdx_2_12927ya6vxtmhu8w0qkwtumw8kjmlv930agjzezfgg6yp3j6agn3gfc',
    to: 'account_tdx_2_12xnfu4evyseqeq57rzhrh8ls6wy76vvc4jnw2kzx3l5ka7wyddxh3l',
    resourceAddress: RADIX_ASSET_RESOURCE,
    publicKey: '3ce4d36fd8bf40fa6f9b0cf2ef8d11853d088589ebdc79055f5a0af55bf7e758',
  },
}
