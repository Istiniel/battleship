import type Player from '../entities/Player'
import type WebSocket from 'ws'
import type Room from '../entities/Room'

export default interface Store {
  players: Map<number, Player>
  rooms: Map<number, Room>
  connections: Map<WebSocket, number>
  gamesCount: number
}

export const store: Store = {
  players: new Map<number, Player>(),
  rooms: new Map<number, Room>(),
  connections: new Map<WebSocket, number>(),
  gamesCount: 0,
}
