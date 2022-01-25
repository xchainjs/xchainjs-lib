import { CosmosSDKClient } from './cosmos'

export const MAINNET_SDK = new CosmosSDKClient({
  server: 'https://api.cosmos.network',
  chainId: 'cosmoshub-3',
})
export const TESTNET_SDK = new CosmosSDKClient({
  server: 'http://lcd.gaia.bigdipper.live:1317',
  chainId: 'gaia-3a',
})
