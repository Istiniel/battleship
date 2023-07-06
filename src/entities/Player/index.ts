// export type IPlayer = InstanceType<Player>

export default class Player {
  public registrationResponse: string
  constructor(public name: string, public password: string, public id: number) {
    this.registrationResponse = JSON.stringify({
      type: 'reg',
      data: JSON.stringify({
        name,
        index: 0,
        error: false,
        errorText: '',
      }),
      id,
    })
  }
}
