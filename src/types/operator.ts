export interface Operator {
  id?: number
  uuid: string
  callsign: string
  name: string
}

export type OperatorInput = Omit<Operator, 'id' | 'uuid'>
