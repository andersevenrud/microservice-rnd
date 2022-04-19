import waitOn from 'wait-on'
import { Kafka } from 'kafkajs'
import { MikroORM } from '@mikro-orm/core'
import { MariaDbDriver } from '@mikro-orm/mariadb'
import { createHttpTerminator } from 'http-terminator'
import { createWinston } from './winston'
import { createApplication } from './app'
import mikroConfig from '../mikro-orm.config'
import config from './config'

async function main() {
  try {
    await waitOn(config.waitOn)

    const kafka = new Kafka(config.kafka)

    const orm = await MikroORM.init<MariaDbDriver>(mikroConfig)
    const producer = kafka.producer()
    const consumer = kafka.consumer({
      groupId: 'api',
      allowAutoTopicCreation: false,
    })

    const logger = createWinston(producer)

    await consumer.connect()
    await producer.connect()
    await orm.connect()

    const { app, subscribe } = await createApplication({
      consumer,
      producer,
      orm,
      logger,
    })

    const server = app.listen(8080)
    const terminator = createHttpTerminator({ server })

    logger.info('API is running...')

    const shutdown = async () => {
      logger.info('API is shutting down...')

      await terminator.terminate()
      await producer.disconnect()
      await orm.close()
    }

    process.once('SIGUSR2', shutdown)
    process.once('SIGINT', shutdown)
    process.once('SIGTERM', shutdown)

    // NOTE: Start late because this blocks the bootstrapping
    await subscribe()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
