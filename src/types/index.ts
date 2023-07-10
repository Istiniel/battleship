export interface RequestBase {
  type: string
  id: number
}

export interface LoginRequest extends RequestBase {
  type: 'reg'
  data: {
    name: string
    password: string
  }
}

export interface Login extends RequestBase {
  type: 'reg'
  data: {
    name: string
    index: number
    error: boolean
    errorText: string
  }
}

export interface UpdateWinners extends RequestBase {
  type: 'update_winners'
  data: [
    {
      name: string
      wins: number
    },
  ]
}

export interface CreateRoomRequest extends RequestBase {
  type: 'create_room'
  data: ''
}

export interface AddUserRequest extends RequestBase {
  type: 'add_user_to_room'
  data: {
    indexRoom: number
  }
}

export interface RoomResponse {
  roomId: number
  roomUsers: [
    {
      name: string
      index: number
    },
  ]
}

export interface UpdateRoom extends RequestBase {
  type: 'update_room'
  data: {
    rooms: RoomResponse[]
  }
}

export interface ShipInfo {
  position: {
    x: number
    y: number
  }
  direction: boolean
  length: number
  type: 'small' | 'medium' | 'large' | 'huge'
}

export enum ShipSize {
  'small' = 1,
  'medium',
  'large',
  'huge',
}

export interface AddShipsRequest extends RequestBase {
  type: 'add_ships'
  data: {
    gameId: number
    ships: ShipInfo[]
    indexPlayer: number
  }
}

export interface StartGameResponse extends RequestBase {
  type: 'start_game'
  data: {
    ships: ShipInfo[]
    currentPlayerIndex: number
  }
}

export interface AttackRequest extends RequestBase {
  type: 'attack'
  data: {
    gameId: number
    x: number
    y: number
    indexPlayer: number
  }
}
