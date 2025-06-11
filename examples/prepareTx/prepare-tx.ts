import { Client as BtcClient, defaultBTCParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { AssetETH, Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { assetAmount, assetToBase, register9Rheader } from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(axios)

type PrepareParmas = {
  sender: string
  recipient: string
  amount: string
  network: Network
}

const prepareEvmTx = async ({ sender, recipient, amount, network }: PrepareParmas) => {
  const client = new EthClient({
    ...defaultEthParams,
    network,
  })
  const unsignedRawTx = await client.prepareTx({
    sender,
    recipient,
    asset: AssetETH,
    amount: assetToBase(assetAmount(amount, 18)),
  })
  console.log(unsignedRawTx)
}

const prepareBtcTx = async ({ sender, recipient, amount, network }: PrepareParmas) => {
  const client = new BtcClient({
    ...defaultBTCParams,
    network,
  })
  const unsignedRawTx = await client.prepareTx({
    sender,
    recipient,
    amount: assetToBase(assetAmount(amount, 8)),
    feeRate: 1,
  })
  console.log(unsignedRawTx)
}

const main = async () => {
  const blockchain = process.argv[2]
  const network = process.argv[3] as Network
  const sender = process.argv[4]
  const recipient = process.argv[5]
  const amount = process.argv[6]

  switch (blockchain) {
    case 'BTC':
      return prepareBtcTx({ sender, recipient, amount, network })
    case 'ETH':
      return prepareEvmTx({ sender, recipient, amount, network })
  }
}

/**
 * yarn preparetx blockchain network sender recipient amount
 * Example: yarn preparetx BTC testnet tb1q2pkall6rf6v6j0cvpady05xhy37erndvku08wp tb1q2pkall6rf6v6j0cvpady05xhy37erndvku08wp 0.0001
 */

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
