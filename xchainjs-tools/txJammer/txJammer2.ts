import * as commander from 'commander'

import { TxJammer } from './TxJammer'

function myParseInt(value: string) {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10)
  if (isNaN(parsedValue)) {
    throw new commander.InvalidArgumentError('Not a number.')
  }
  return parsedValue
}
function myParseMinMaxAmounts(value: string) {
  // parseInt takes a string and a radix
  const parts = value.split('-')
  if (parts.length !== 2) {
    throw new commander.InvalidArgumentError('min-max must be formateed like 1-3 ')
  }
  myParseInt(parts[0])
  myParseInt(parts[1])
  return parts
}
const program = new commander.Command()
program.option('-e, --estimateOnly', 'do not peerfem a swap, only perform an estimate swap ')
program.requiredOption('-w1, --wallet1 <file> <password>', 'you must send in a json wallet ')
program.requiredOption('-p1, --password1 <password>', 'you must send in a password for wallet 1')
program.requiredOption('-w2, --wallet2 <file> ', 'you must send in a json wallet ')
program.requiredOption('-p2, --password2 <password>', 'you must send in a password for wallet 2')
program.requiredOption('-d, --durationSeconds <number>', 'the seconds you want to run the txJammer for', myParseInt)
program.requiredOption('-p, --pauseTimeSeconds <number>', 'the seconds you want to pause between actions', myParseInt)
program.requiredOption('-a, --txAmountInUsd <min-max>', 'the value of each tx in USD terms', myParseMinMaxAmounts)

// txJammer --wallet1 ./sdasdasd/asdasd.json --wallet2 ./sdasdasd/asdasd.json
// --durationSeconds 600
// --pauseTimeSeconds 5
// --txAmountInUsd 0.2-5
// --estimateOnly
// --config swap ETH 10%, BTC 10%, ETH.ETH 5%, ETH.USDT 5%, *
// --config addLp ETH 10%, BTC 50%, ETH.USDT 5%, *
// --config transfer THOR.RUNE 50%, ETH/USDT 5%, *
program.parse()

const options = program.opts()
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
)

async function main() {
  // console.log(JSON.stringify(options, null, 2))
  await txJammer.start()
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
