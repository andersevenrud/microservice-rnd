import waitOn from 'wait-on'
import { Kafka } from 'kafkajs'
import { MariaDbDriver } from '@mikro-orm/mariadb'
import { MikroORM } from '@mikro-orm/core'
import { createWinston } from './winston'
import { createApplication } from './app'
import { PM2Manager } from './manager'
import mikroConfig from '../mikro-orm.config'
import config from './config'

async function shutdownAll(list: (() => any)[]) {
  for (const fn of list) {
    try {
      await fn()
    } catch (e) {
      console.error(e)
    }
  }
}

async function main() {
  try {
    await waitOn(config.waitOn)

    const kafka = new Kafka(config.kafka)
    const manager = new PM2Manager()
    const orm = await MikroORM.init<MariaDbDriver>(mikroConfig)
    const producer = kafka.producer()
    const consumer = kafka.consumer({
      groupId: 'runner',
      allowAutoTopicCreation: false,
    })
    const logger = createWinston('runner', producer)

    await manager.connect()
    await consumer.connect()
    await producer.connect()
    await orm.connect()

    const destroy = await createApplication({
      producer,
      consumer,
      orm,
      manager,
      logger,
    })

    logger.info('Runner is running...')

    const shutdown = async (failure = false) => {
      logger.info('Runner is shutting down...')

      try {
        await shutdownAll([
          () => destroy(),
          () => manager.kill(),
          () => manager.disconnect(),
          () => consumer.disconnect(),
          () => producer.disconnect(),
          () => orm.close(),
        ])
      } finally {
        process.exit(failure ? 1 : 0)
      }
    }

    consumer.on(consumer.events.CRASH, ({ payload: { restart } }) => {
      if (!restart) {
        shutdown(true)
      }
    })

    process.once('SIGUSR2', () => shutdown())
    process.once('SIGINT', () => shutdown())
    process.once('SIGTERM', () => shutdown())
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
