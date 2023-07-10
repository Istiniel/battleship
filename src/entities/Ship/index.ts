import type { ShipInfo } from '../../types'

export type ShipInstance = InstanceType<typeof Ship>

export class Ship {
  public position: { x: number; y: number }
  public direction: boolean
  public length: number
  public type: 'small' | 'medium' | 'large' | 'huge'

  public health: number
  public isSunk: boolean = false

  constructor(shipInstance: ShipInfo) {
    const { position, direction, length, type } = shipInstance
    this.position = position
    this.direction = direction
    this.length = length
    this.health = this.length
    this.type = type
  }

  addDamage(): void {
    this.health -= 1

    if (this.health === 0) {
      this.isSunk = true
    }
  }
}
