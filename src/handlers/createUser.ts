import Player from '../entities/Player'
import { store } from '../store'
import type { LoginRequest } from '../types'

export default function createUser(request: LoginRequest): Player {
  request.data = JSON.parse(request.data as unknown as string)

  const {
    data: { name, password },
    id,
  } = request
  const newPlayer = new Player(name, password, id)
  store.players.push(newPlayer)

  return newPlayer
}
