import type WebSocket from 'ws'
import { type Ship } from '../../types'

export default class Player {
  public static numberOfPlayers: number = -1
  public registrationResponse: string
  public id: number
  constructor(
    public name: string,
    public password: string,
    public ws: WebSocket,
    public ships: Ship[] = [],
    public isReady: boolean = false,
  ) {
    this.id = Player.numberOfPlayers + 1
    this.registrationResponse = JSON.stringify({
      type: 'reg',
      data: JSON.stringify({
        name,
        index: (Player.numberOfPlayers += 1),
        error: false,
        errorText: '',
      }),
      id: 0,
    })
  }

  setShips(ships: Ship[]): void {
    this.ships = ships
    this.isReady = true
  }
}
