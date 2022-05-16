import { Kafka, Producer } from 'kafkajs'
import { Logger } from 'winston'
import { Handler } from 'express'
import { MikroORM } from '@mikro-orm/core'

export interface ApplicationContext {
  logger: Logger
  producer: Producer
  orm: MikroORM
  kafka: Kafka
  gate: Handler
}
