import { Aggregator } from '@xchainjs/xchain-aggregator'
import { AssetBTC, BTCChain, Client as BTCClient, defaultBTCParams } from '@xchainjs/xchain-bitcoin'
import { AssetETH, Client as ETHClient, ETHChain, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { CryptoAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

const main = async () => {
  const phrase = process.argv[2] || ''
  const amount = assetToBase(assetAmount(process.argv[4], Number(process.argv[5] || 8)))

  const wallet = new Wallet({
    BTCChain: new BTCClient({ ...defaultBTCParams, phrase }),
    ETHChain: new ETHClient({ ...defaultEthParams, phrase }),
  })

  const aggregator = new Aggregator({
    wallet,
  })

  const txSubmited = await aggregator.doSwap({
    fromAsset: AssetBTC,
    destinationAsset: AssetETH,
    fromAddress: await wallet.getAddress(BTCChain),
    destinationAddress: await wallet.getAddress(ETHChain),
    amount: new CryptoAmount(amount, AssetBTC),
  })

  console.log(txSubmited)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
