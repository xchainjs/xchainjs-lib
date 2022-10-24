import { ThorchainCache } from '../src/thorchain-cache'
import { TransactionStage } from '../src/thorchain-checktx'

const thorchainCache = new ThorchainCache()

const checkTxStage = new TransactionStage(thorchainCache)
const liveHash = [
  '8AB0C6C980D1B98AE3AD566848FBE66A05B4D01386F63E3164C6BED8619972E2', // unkown transaction
  '508478AC13EA0F675A57BD980B964B2F89B9CCD3CEC6E16FA7A598163E17D422', // THOR in and ETH Out
  //  '991DFE33AC4482CC7A1E3BF1142E121A315EED18ED8E8FDDDC678E8F176DFCBA', // THOR in, ETH out
  '619F2005282F3EB501636546A8A3C3375495B0E9F04130D8945A6AF2158966BC', // BTC in, Synth BTC out
]

describe('Thorchain query checkTx Integration Tests', () => {
  //can't use delays inside a async callback :(
  it(`Should check transaction and return the stage`, async () => {
    const txStatus = await checkTxStage.checkTxProgress(liveHash[0], 0)
    console.log(txStatus)
    //await delay(txStatus.seconds * 1000)
    if (txStatus.errors.length > 0) {
      // display error in widget
    } else {
      const afterdelay1 = await checkTxStage.checkTxProgress(liveHash[0], txStatus.progress)
      //await delay(afterdelay1.seconds * 1000)
      console.log(afterdelay1)
      const afterdelay2 = await checkTxStage.checkTxProgress(liveHash[0], afterdelay1.progress)
      //await delay(afterdelay2.seconds * 1000)
      console.log(afterdelay2)
    }
  })
})
