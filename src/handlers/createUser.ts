import Player from '../entities/Player'
import { store } from '../store'
import type { LoginRequest } from '../types'
import type WebSocket from 'ws'

export default function createUser(request: LoginRequest, ws: WebSocket): Player {
  request.data = JSON.parse(request.data as unknown as string)

  const {
    data: { name, password },
  } = request
  const newPlayer = new Player(name, password, ws)

  const { players, connections } = store
  players.set(newPlayer.id, newPlayer)
  connections.set(ws, newPlayer.id)

  return newPlayer
}
