import { httpServer } from './src/http_server/index'
import { WebSocketServer } from './src/ws_server'
import doteenv from 'dotenv'
doteenv.config()

const WS_PORT = Number(process.env.WS_PORT ?? 3000)
const PORT = Number(process.env.PORT ?? 8181)

console.log(`Start static http server on the ${PORT} port!`)
httpServer.listen(PORT)

const ws = new WebSocketServer({ port: WS_PORT })
console.log(`WebSocket server starts on the ${WS_PORT} port, ${JSON.stringify(ws.wss.address())}`)
