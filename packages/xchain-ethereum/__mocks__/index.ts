import { mock_etherscan_api } from './etherscan-api'
import { mock_infra_api } from './infra-api'

export const mock_all_api = (etherscanUrl: string, infraUrl: string, alchemyUrl: string, method: string, result: string) => {
  mock_etherscan_api(etherscanUrl, method, result)
  mock_infra_api(infraUrl, method, result)
  mock_infra_api(alchemyUrl, method, result)
}
