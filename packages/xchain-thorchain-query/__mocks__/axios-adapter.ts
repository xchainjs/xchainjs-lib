import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

export default mock

export const importjson = async (file) => (await import(file, { with: { type: 'json' } })).default
