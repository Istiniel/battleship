import type Room from '../entities/Room'
import { store } from '../store'
import { type RoomResponse } from '../types'

export function updateRoom(): string {
  const rooms: Room[] = Array.from(store.rooms.values())

  const data = rooms
    .filter((room) => room.players.length === 1)
    .reduce<RoomResponse[]>((acc, room) => {
      const currentPlayer = room.players[0]
      const freeRoom: RoomResponse = {
        roomId: room.id,
        roomUsers: [{ name: currentPlayer.name, index: currentPlayer.id }],
      }

      return acc.concat(freeRoom)
    }, [])

  return JSON.stringify({ type: 'update_room', data: JSON.stringify(data), id: 0 })
}
