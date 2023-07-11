import updateScore from '../../handlers/updateScore'
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

    const loser = this.checkGameEnd()

    if (loser !== -1) {
      const finishMessage = JSON.stringify({
        type: 'finish',
        data: JSON.stringify({
          winPlayer: loser,
        }),
        id: 0,
      })

      this.players.forEach((player) => {
        player.ws.send(finishMessage)
      })

      updateScore()
      console.log(`Game is over! ${loser} lost `)

      return
    }

    this.players.forEach((player) => {
      console.log(`turn: your turn - ${playerId} `)
      player.ws.send(turn)
    })
  }

  checkGameEnd(): number {
    const [player1, player2] = this.players

    if (player1.isDefeated) {
      player1.updateScore(false)
      player2.updateScore(true)

      const isPlayerInScoreTable = store.winners.some((winner) => winner.name === player2.name)

      if (isPlayerInScoreTable) {
        store.winners = store.winners.map((winner) => {
          if (winner.name === player2.name) {
            return { ...winner, wins: player2.wins }
          }

          return winner
        })
      } else {
        store.winners.push({ name: player2.name, wins: player2.wins })
      }

      return player2.id
    }

    if (player2.isDefeated) {
      player2.updateScore(false)
      player1.updateScore(true)

      const isPlayerInScoreTable = store.winners.some((winner) => winner.name === player2.name)

      if (isPlayerInScoreTable) {
        store.winners = store.winners.map((winner) => {
          if (winner.name === player2.name) {
            return { ...winner, wins: player2.wins }
          }

          return winner
        })
      } else {
        store.winners.push({ name: player2.name, wins: player2.wins })
      }

      return player1.id
    }

    return -1
  }

  setFirstTurn(): void {
    const playerNumber = Math.round(Math.random())
    const playerId = this.players[playerNumber].id
    this.setTurn(playerId)
  }
}
