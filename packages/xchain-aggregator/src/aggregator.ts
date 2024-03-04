import { MayaProtocol, ThorProtocol } from './protocols'
import { IProtocol } from './types'

// Class definition for an Aggregator
export class Aggregator {
  private protocols: IProtocol[]

  constructor() {
    this.protocols = [new ThorProtocol(), new MayaProtocol()]
  }
}
