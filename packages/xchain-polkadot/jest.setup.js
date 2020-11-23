const mock = require('mock-socket')
WebSocket = mock.WebSocket

jest.setTimeout(30000)
console.log = jest.fn()
