import { Entity, Property, PrimaryKey } from '@mikro-orm/core'

@Entity()
export class ClientInstance {
  @PrimaryKey()
  id!: number

  @Property()
  uuid!: string

  @Property({ default: false })
  online!: boolean

  @Property({ default: 'stopped' })
  state!: string

  @Property({ type: 'datetime' })
  createdAt!: Date

  @Property({ nullable: true, type: 'datetime' })
  lastActiveAt!: Date

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt!: Date

  @Property({ nullable: true, type: 'datetime' })
  deletedAt!: Date
}
