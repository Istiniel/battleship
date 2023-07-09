// import { store } from '../store'

export function createGame(idPlayer: number, roomId: number): string {
  const response = JSON.stringify({
    type: 'create_game',
    data: JSON.stringify({
      idGame: roomId,
      idPlayer,
    }),
    id: 0,
  })

  // store.gamesCount += 1
  return response
}
