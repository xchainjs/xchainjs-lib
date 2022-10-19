import { MIDGARD_API_TS_URL } from './config'
import { Configuration, DefaultApi } from './generated/midgardApi'

const baseUrl = MIDGARD_API_TS_URL
const defaultConfig = new Configuration({ basePath: baseUrl })

export * from './generated/midgardApi'
export * from './config'
export class MidgardApi extends DefaultApi {
  constructor(config = defaultConfig) {
    super(config)
  }
}
