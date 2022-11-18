import { ThorchainCache } from '../src/thorchain-cache'
import { TransactionStage } from '../src/thorchain-checktx'

const thorchainCache = new ThorchainCache()

const checkTxStage = new TransactionStage(thorchainCache)
// const liveHash = [
//   'E5A760EA5C5C0E89450598A63E65CBCCA71CBC52FBCC94098B85811ACAE0F279', // unkown transaction
//   '508478AC13EA0F675A57BD980B964B2F89B9CCD3CEC6E16FA7A598163E17D422', // THOR in and ETH Out
//   //  '991DFE33AC4482CC7A1E3BF1142E121A315EED18ED8E8FDDDC678E8F176DFCBA', // THOR in, ETH out
//   '619F2005282F3EB501636546A8A3C3375495B0E9F04130D8945A6AF2158966BC', // BTC in, Synth BTC out
// ]

describe('Thorchain query checkTx Integration Tests', () => {
  //can't use delays inside a async callback :(
  // it(`Should check transaction and return the stage`, async () => {
  //   const txStatus = await checkTxStage.checkTxProgress(liveHash[0], 0)
  //   console.log(txStatus)
  //   if (txStatus.progress >= 3) {
  //     console.log(`Done`, txStatus)
  //   } else {
  //     const afterdelay1 = await checkTxStage.checkTxProgress(liveHash[0], txStatus.progress)
  //     console.log(afterdelay1)
  //     const afterdelay2 = await checkTxStage.checkTxProgress(liveHash[0], afterdelay1.progress)
  //     console.log(afterdelay2)
  //   }
  // })
  it(`Should check transaction and return the stage`, async () => {
    const x = await checkTxStage.checkTxProgress2('E5C8AA800DD54F9D069E6822E99EC66DF8FA81DAE748CE534B9325AF2A4B1666')
    console.log(x)
  })
})
