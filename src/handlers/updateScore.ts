import { store } from '../store'

export default function updateScore(): void {
  const message = JSON.stringify({
    type: 'update_winners',
    data: JSON.stringify(store.winners),
    id: 0,
  })

  for (const ws of store.connections.keys()) {
    ws.send(message)
  }
}
