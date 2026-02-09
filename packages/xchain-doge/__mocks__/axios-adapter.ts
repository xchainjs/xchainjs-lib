import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

export default mock

export const importjson = async (file: string) => (await import(file, { with: { type: 'json' } })).default
