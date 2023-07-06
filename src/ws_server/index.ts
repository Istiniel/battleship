import { EventEmitter } from 'node:events'
import WebSocket from 'ws'
import type { RequestBase, LoginRequest } from '../types'
import createUser from '../handlers/createUser'

interface WebSocketOptions {
  port: number
}

export class WebSocketServer extends EventEmitter {
  public wss: WebSocket.Server
  constructor(public options: WebSocketOptions = { port: 3000 }) {
    super()

    const { port } = this.options
    this.wss = new WebSocket.Server({ port })
    this.start()
  }

  start(): void {
    this.wss.on('connection', (ws) => {
      console.log('new player has connected')

      ws.on('message', (data) => {
        this.wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            const request: RequestBase = JSON.parse((data as Uint8Array).toString())

            if (request.type === 'reg') {
              const newPlayer = createUser(request as LoginRequest)
              client.send(newPlayer.registrationResponse)
            }
          }
        })
      })

      ws.on('close', () => {
        console.log('Client is out')
      })
    })
  }
}
