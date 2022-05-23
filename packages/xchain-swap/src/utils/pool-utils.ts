import { Configuration, MIDGARD_API_TS_URL, MidgardApi } from '@xchainjs/xchain-midgard/lib'

const midgardApi = new MidgardApi(new Configuration({ basePath: MIDGARD_API_TS_URL }))
