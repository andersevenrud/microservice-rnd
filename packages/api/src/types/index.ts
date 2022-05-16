import { Kafka, Producer } from 'kafkajs'
import { Logger } from 'winston'
import { MikroORM } from '@mikro-orm/core'

export interface ApplicationContext {
  logger: Logger
  producer: Producer
  orm: MikroORM
  kafka: Kafka
}
