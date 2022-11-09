import { assetFromStringEx } from '@xchainjs/xchain-util'
import * as commander from 'commander'

import { TxJammer } from './TxJammer'
import { ActionConfig, AddLpConfig, JammerAction, SwapConfig, TransferConfig } from './types'

function parseCustomSwap(value: string): SwapConfig[] {
  // example --configSwap ETH.ETH BTC.BTC 100, * * 100
  const configs = value.split(',')
  const swapConfigs: SwapConfig[] = []
  for (const config of configs) {
    const parts = config.trim().split(/\s+/)
    if (parts.length !== 3)
      throw Error(`${config} must have 3 parameters: [assetString | *] [assetString | *] [weight]`)
    //check asset strings parse ok
    parts[0] === '*' || assetFromStringEx(parts[0])
    parts[1] === '*' || assetFromStringEx(parts[1])

    const swapConfig = {
      sourceAssetString: parts[0],
      destAssetString: parts[1],
      weight: Number(parts[2]),
    }
    swapConfigs.push(swapConfig)
  }
  return swapConfigs
}
function parseCustomTransfer(value: string): TransferConfig[] {
  // example --configTransfer ETH.ETH 100, * 100
  const configs = value.split(',')
  const transferConfigs: TransferConfig[] = []
  for (const config of configs) {
    const parts = config.trim().split(/\s+/)
    if (parts.length !== 2) throw Error(`${config} must have 2 parameters: [assetString | *] [weight]`)
    //check asset strings parse ok
    parts[0] === '*' || assetFromStringEx(parts[0])

    const transferConfig = {
      assetString: parts[0],
      weight: Number(parts[1]),
    }
    transferConfigs.push(transferConfig)
  }
  return transferConfigs
}
function parseCustomAddLP(value: string): AddLpConfig[] {
  // example --configAddlp BTC.BTC 100, * 100
  const configs = value.split(',')
  const addlpConfigs: AddLpConfig[] = []
  for (const config of configs) {
    const parts = config.trim().split(/\s+/)
    console.log(parts)
    if (parts.length !== 2) throw Error(`${config} must have 2 parameters: [assetString | *] [weight]`)
    //check asset strings parse ok
    parts[0] === '*' || assetFromStringEx(parts[0])

    const addlpConfig = {
      assetString: parts[0],
      weight: Number(parts[1]),
    }
    addlpConfigs.push(addlpConfig)
  }
  return addlpConfigs
}
function parseCustomActions(value: string): ActionConfig[] {
  // example --configActions transfer 200, addLp 200
  const configs = value.split(',')
  const actionConfigs: ActionConfig[] = []
  for (const config of configs) {
    const parts = config.trim().split(/\s+/)
    if (parts.length !== 2) throw Error(`${config} must have 1 parameters: [actionType] [weight]`)
    const actionConfig = {
      action: parts[0] as JammerAction,
      weight: Number(parts[1]),
    }
    actionConfigs.push(actionConfig)
  }
  return actionConfigs
}
function parseInteger(value: string) {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10)
  if (isNaN(parsedValue)) {
    throw new commander.InvalidArgumentError('Not a number.')
  }
  return parsedValue
}
function parseMinMaxAmounts(value: string) {
  // parseInt takes a string and a radix
  const parts = value.split('-')
  if (parts.length !== 2) {
    throw new commander.InvalidArgumentError('min-max must be formated like 1-3 ')
  }
  parseInt(parts[0])
  parseInt(parts[1])
  return parts
}

const program = new commander.Command()
program.option('-e, --estimateOnly', 'do not perform a swap, only perform an estimate swap ')
program.requiredOption('-w1, --wallet1 <file> ', 'you must send in a json wallet ')
program.requiredOption('-p1, --password1 <password>', 'you must send in a password for wallet 1')
program.requiredOption('-w2, --wallet2 <file> ', 'you must send in a json wallet ')
program.requiredOption('-p2, --password2 <password>', 'you must send in a password for wallet 2')
program.requiredOption('-d, --durationSeconds <number>', 'the seconds you want to run the txJammer for', parseInteger)
program.requiredOption('-p, --pauseTimeSeconds <number>', 'the seconds you want to pause between actions', parseInteger)
program.requiredOption('-u, --txAmountInUsd <min-max>', 'the value of each tx in USD terms', parseMinMaxAmounts)
program.option('-s, --configActions <config>', 'custom action configuration ', parseCustomActions)
program.option('-s, --configSwap <config>', 'custom swap configuration ', parseCustomSwap)
program.option('-a, --configAddLp <config>', 'custom addLp configuration ', parseCustomAddLP)
program.option('-w, --configWithdrawLp <config>', 'custom withdrawLp configuration ', parseCustomSwap)
program.option('-t, --configTransfer <config>', 'custom transfer configuration ', parseCustomTransfer)

program.parse()

const options = program.opts()
console.log(options)
const txJammer = new TxJammer(
  options.estimateOnly,
  Number(options.txAmountInUsd[0]),
  Number(options.txAmountInUsd[1]),
  Number(options.durationSeconds),
  options.pauseTimeSeconds,
  options.wallet1,
  options.password1,
  options.wallet2,
  options.password2,
  options.configActions || [],
  options.configSwap || [],
  options.configTransfer || [],
  options.configAddLp || [],
)

async function main() {
  // console.log(JSON.stringify(options, null, 2))
  await txJammer.start()
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
