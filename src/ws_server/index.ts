import { EventEmitter } from 'node:events'
import WebSocket from 'ws'
import type { RequestBase, LoginRequest, AddUserRequest, AddShipsRequest } from '../types'
import createUser from '../handlers/createUser'
import createRoom from '../handlers/createRoom'
import { store } from '../store'
import { updateRoom } from '../handlers/updateRoom'
import { createGame } from '../handlers/createGame'

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
        const request: RequestBase = JSON.parse((data as Uint8Array).toString())

        if (request.type === 'reg') {
          const newPlayer = createUser(request as LoginRequest, ws)
          ws.send(newPlayer.registrationResponse)
          console.log(`new player, also known as ${newPlayer.name} is created`)

          this.wss.clients.forEach((client) => {
            client.send(updateRoom())
          })
        }

        if (request.type === 'create_room') {
          const playerId = store.connections.get(ws)

          const proceed = !Array.from(store.rooms.values()).some(
            (room) => room.playerId === playerId,
          )

          if (proceed) {
            const newRoom = createRoom(playerId ?? -1)
            console.log(`new room ${newRoom.id} is created`)

            this.wss.clients.forEach((client) => {
              client.send(updateRoom())
            })
          }
        }

        if (request.type === 'add_user_to_room') {
          const request: AddUserRequest = JSON.parse((data as Uint8Array).toString())
          const playerId = store.connections.get(ws)
          const roomId: { indexRoom: number } = JSON.parse(request.data as unknown as string)

          if (playerId !== undefined) {
            const destinationRoom = store.rooms.get(roomId.indexRoom)

            if (destinationRoom !== undefined) {
              const firstPlayer = destinationRoom.players[0]
              destinationRoom.addPlayerToRoom(playerId)
              console.log(`Player: ${playerId} is added to the room ${roomId.indexRoom}`)

              ws.send(createGame(playerId, roomId.indexRoom))
              firstPlayer.ws.send(createGame(firstPlayer.id, roomId.indexRoom))
              console.log(`Player: ${firstPlayer.id} is added to the room ${roomId.indexRoom}`)
              console.log('Game is created')
            }

            this.wss.clients.forEach((client) => {
              client.send(updateRoom())
            })
          }
        }

        if (request.type === 'add_ships') {
          const addShipsRequest = request as AddShipsRequest
          addShipsRequest.data = JSON.parse(addShipsRequest.data as unknown as string)
          const {
            data: { gameId, ships, indexPlayer },
          } = addShipsRequest

          const currentGame = store.rooms.get(gameId)
          const firstPlayer = store.players.get(indexPlayer)

          if (firstPlayer !== undefined) {
            firstPlayer.setShips(ships)
            console.log(`ships were added to player ${firstPlayer.name} field`)
          }

          const startTheGame = currentGame?.players.every((player) => player.isReady)

          if ((startTheGame ?? false) && currentGame !== undefined) {
            const [player1, player2] = currentGame?.players

            const firstPlayerResponse = {
              type: 'start_game',
              data: JSON.stringify({
                ships: player2.ships,
                currentPlayerIndex: player2.id,
              }),
              id: 0,
            }

            const secondPlayerResponse = {
              type: 'start_game',
              data: JSON.stringify({
                ships: player1.ships,
                currentPlayerIndex: player1.id,
              }),
              id: 0,
            }

            player1.ws.send(JSON.stringify(secondPlayerResponse))
            player2.ws.send(JSON.stringify(firstPlayerResponse))
            console.log(`the game ${currentGame.id} is started`)
          }
        }
      })

      ws.on('close', () => {
        console.log('Client is out')
        store.connections.delete(ws)
      })
    })
  }
}
