import { EventEmitter } from 'node:events'
import WebSocket from 'ws'
import type {
  RequestBase,
  LoginRequest,
  AddUserRequest,
  AddShipsRequest,
  AttackRequest,
} from '../types'
import createUser from '../handlers/createUser'
import createRoom from '../handlers/createRoom'
import { store } from '../store'
import { updateRoom } from '../handlers/updateRoom'
import { createGame } from '../handlers/createGame'
import updateScore from '../handlers/updateScore'

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
    this.wss.on('close', () => {
      console.log('WebSocket server is off now')
    })

    this.wss.on('connection', (ws) => {
      console.log('new player has connected')

      ws.on('message', (data) => {
        const request: RequestBase = JSON.parse((data as Uint8Array).toString())

        if (request.type === 'reg') {
          const newPlayer = createUser(request as LoginRequest, ws)
          ws.send(newPlayer.registrationResponse)
          console.log(`reg: new player, also known as ${newPlayer.name} is created`)

          this.wss.clients.forEach((client) => {
            client.send(updateRoom())
          })
          console.log('update_room: room list is updated ')

          updateScore()
          console.log('update_winners: winners list is updated ')
        }

        if (request.type === 'create_room') {
          const playerId = store.connections.get(ws)

          const proceed = true

          if (proceed) {
            const newRoom = createRoom(playerId ?? -1)
            console.log(`create_game: new room ${newRoom.id} is created`)

            this.wss.clients.forEach((client) => {
              client.send(updateRoom())
            })

            console.log('update_room: room list is updated ')
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

              if (firstPlayer.id === playerId) {
                return
              }

              destinationRoom.addPlayerToRoom(playerId)
              console.log(
                `add_user_to_room: Player: ${playerId} is added to the room ${roomId.indexRoom}`,
              )

              ws.send(createGame(playerId, roomId.indexRoom))
              firstPlayer.ws.send(createGame(firstPlayer.id, roomId.indexRoom))
              console.log(
                `add_user_to_room: Player: ${firstPlayer.id} is added to the room ${roomId.indexRoom}`,
              )
              console.log('start_game: Game is created')
            }

            this.wss.clients.forEach((client) => {
              client.send(updateRoom())
            })
            console.log('update_room: room list is updated ')

            updateScore()
            console.log('update_winners: winners list is updated ')
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

            currentGame.setFirstTurn()
            console.log(`the game ${currentGame.id} is started`)
          }
        }

        if (request.type === 'attack') {
          const attackRequest = request as AttackRequest
          attackRequest.data = JSON.parse(attackRequest.data as unknown as string)

          const currentGame = store.rooms.get(attackRequest.data.gameId)

          const proceed = currentGame?.headingPlayerId === attackRequest.data.indexPlayer

          const opponent = currentGame?.players.filter(
            (player) => player.id !== attackRequest.data.indexPlayer,
          )[0]

          if (opponent !== undefined && proceed) {
            console.log(`attack: Player ${attackRequest.data.indexPlayer} tries to attack`)

            const { x, y } = attackRequest.data
            const result = opponent.checkAttack(x, y)

            if (result === 'same') {
              return
            }

            const response = {
              type: 'attack',
              data: JSON.stringify({
                position: {
                  x,
                  y,
                },
                currentPlayer: attackRequest.data.indexPlayer,
                status: result,
              }),
              id: 0,
            }

            currentGame?.players.forEach((player) => {
              player.ws.send(JSON.stringify(response))
            })

            if (result === 'miss') {
              currentGame?.setTurn(opponent.id)
            } else {
              currentGame?.setTurn(attackRequest.data.indexPlayer)
            }
          }
        }

        if (request.type === 'randomAttack') {
          const attackRequest = request as AttackRequest
          attackRequest.data = JSON.parse(attackRequest.data as unknown as string)

          const currentGame = store.rooms.get(attackRequest.data.gameId)

          const opponent = currentGame?.players.filter(
            (player) => player.id !== attackRequest.data.indexPlayer,
          )[0]

          if (opponent !== undefined) {
            console.log(`attack: Player ${attackRequest.data.indexPlayer} tries to attack`)
            const { result, x, y } = opponent.checkRandomCell()

            if (result === 'same') {
              return
            }

            const response = {
              type: 'attack',
              data: JSON.stringify({
                position: {
                  x,
                  y,
                },
                currentPlayer: attackRequest.data.indexPlayer,
                status: result,
              }),
              id: 0,
            }

            currentGame?.players.forEach((player) => {
              player.ws.send(JSON.stringify(response))
            })

            currentGame?.setTurn(opponent.id)
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
