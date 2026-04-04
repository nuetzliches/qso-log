import { db } from '../database'
import type { Operator, OperatorInput } from '../../types/operator'

export const operatorRepository = {
  async add(input: OperatorInput): Promise<number> {
    return db.operators.add({
      ...input,
      uuid: crypto.randomUUID(),
    } as Operator)
  },

  async update(id: number, changes: Partial<Operator>): Promise<void> {
    await db.operators.update(id, changes)
  },

  async delete(id: number): Promise<void> {
    await db.operators.delete(id)
  },

  async getAll(): Promise<Operator[]> {
    return db.operators.orderBy('callsign').toArray()
  },

  async getById(id: number): Promise<Operator | undefined> {
    return db.operators.get(id)
  },

  async count(): Promise<number> {
    return db.operators.count()
  },
}
