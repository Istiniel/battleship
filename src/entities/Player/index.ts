import type WebSocket from 'ws'
import { Ship } from '../Ship'
import type { ShipInfo } from '../../types'
import { getRandomNum } from '../../helpers/getRandomNum'

export default class Player {
  public static numberOfPlayers: number = -1
  public registrationResponse: string
  public id: number
  public cells: string[] = Array(100)
    .fill('')
    .map((_, index) => {
      return `${index % 10}-${Math.floor(index / 10)}`
    })

  public mineCells = new Map<string, Ship>()

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

  setShips(ships: ShipInfo[]): void {
    this.ships = ships.map((shipInfo) => {
      const ship = new Ship(shipInfo)
      const { x, y } = shipInfo.position
      this.mineCells.set(`${x}-${y}`, ship)

      if (shipInfo.direction) {
        for (let i = 1; i <= shipInfo.length; i++) {
          this.mineCells.set(`${x}-${y + i}`, ship)
        }
      } else {
        for (let i = 1; i <= shipInfo.length; i++) {
          this.mineCells.set(`${x + i}-${y}`, ship)
        }
      }

      return ship
    })

    this.isReady = true
  }

  checkAttack(x: number, y: number): string {
    this.cells.filter((cell) => cell !== `${x}-${y}`)

    if (this.mineCells.has(`${x}-${y}`)) {
      const ship = this.mineCells.get(`${x}-${y}`)
      ship?.addDamage()

      if (ship?.isSunk ?? false) {
        return 'killed'
      } else {
        return 'shot'
      }
    }

    return 'miss'
  }

  checkRandomCell(): { result: string; x: number; y: number } {
    const index = getRandomNum(0, this.cells.length - 1)

    const [x, y] = this.cells[index].split('-').map((coord) => +coord)

    return { result: this.checkAttack(x, y), x, y }
  }
}
