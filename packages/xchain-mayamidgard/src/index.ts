import { Configuration, DefaultApi } from './generated/midgardApi'

export * from './generated/midgardApi'
export * from './config'
export class MidgardApi extends DefaultApi {
  constructor(config = new Configuration({ basePath: 'https://midgard.mayachain.info' })) {
    super(config)
  }
}
