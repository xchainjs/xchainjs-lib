import { Configuration, MIDGARD_API_TS_URL, MidgardApi } from '@xchainjs/xchain-midgard'

const midgardApi = new MidgardApi(new Configuration({ basePath: MIDGARD_API_TS_URL }))
