import { store } from '../../store'
import type Player from './../Player/index'

export default class Room {
  public static numberOfRooms: number = -1
  public registrationResponse: string
  public id: number
  public players: Player[]
  public headingPlayerId: number = -1
  constructor(public playerId: number) {
    this.players = []

    this.id = Room.numberOfRooms + 1
    this.registrationResponse = JSON.stringify({
      type: 'create_game',
      data: JSON.stringify({
        idGame: (Room.numberOfRooms += 1),
        idPlayer: 1,
      }),
      id: 0,
    })

    this.addPlayerToRoom(playerId)
  }

  addPlayerToRoom(playerId: number): void {
    const player = store.players.get(playerId)

    if (player !== undefined) {
      this.players.push(player)
    }
  }

  setTurn(playerId: number): void {
    this.headingPlayerId = playerId
    const turn = JSON.stringify({
      type: 'turn',
      data: JSON.stringify({ currentPlayer: playerId }),
      id: 0,
    })

    this.players.forEach((player) => {
      player.ws.send(turn)
    })
  }

  setFirstTurn(): void {
    const playerNumber = Math.round(Math.random())
    const playerId = this.players[playerNumber].id
    this.setTurn(playerId)
  }
}
