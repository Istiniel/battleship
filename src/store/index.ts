import type Player from '../entities/Player'

export default interface Store {
  players: Player[]
}

export const store: Store = {
  players: [],
}
