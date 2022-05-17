import { v4 } from 'uuid'
import { Entity, Property, PrimaryKey } from '@mikro-orm/core'

@Entity()
export class ClientInstance {
  @PrimaryKey()
  id!: number

  @Property()
  uuid: string = v4()

  @Property({ default: false })
  online!: boolean

  @Property({ default: 'stopped' })
  state!: string

  @Property({ type: 'datetime' })
  createdAt: Date = new Date()

  @Property({ nullable: true, type: 'datetime' })
  lastActiveAt!: Date

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Property({ nullable: true, type: 'datetime' })
  deletedAt!: Date
}
