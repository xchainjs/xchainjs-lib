import MockAdapter from 'axios-mock-adapter'

import { dataAPI } from '../src/haven/api'

const mock = new MockAdapter(dataAPI)

export default mock
