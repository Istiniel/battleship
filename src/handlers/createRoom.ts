import Room from '../entities/Room'
import { store } from '../store'

export default function createRoom(playerId: number): Room {
  const newRoom = new Room(playerId)

  store.rooms.set(newRoom.id, newRoom)

  return newRoom
}
