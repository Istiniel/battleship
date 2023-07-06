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

export interface CreateRoom extends RequestBase {
  type: 'create_room'
  data: ''
}

export interface AddUser extends RequestBase {
  type: 'add_user_to_room'
  data: {
    indexRoom: number
  }
}

export interface UpdateRoom extends RequestBase {
  type: 'update_room'
  data: {
    rooms: [
      {
        roomId: number
        roomUsers: [
          {
            name: string
            index: number
          },
        ]
      },
    ]
  }
}
