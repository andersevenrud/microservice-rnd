import waitOn from 'wait-on'
import { Kafka, RetryOptions } from 'kafkajs'
import { MariaDbDriver } from '@mikro-orm/mariadb'
import { MikroORM } from '@mikro-orm/core'
import { createWinston } from './winston'
import { createApplication } from './app'
import { PM2Manager } from './manager'
import mikroConfig from '../mikro-orm.config'

async function main() {
  try {
    await waitOn({
      resources: ['tcp:kafka:9092', 'tcp:db:3306'],
    })

    const kafka = new Kafka({
      clientId: 'runner',
      brokers: ['kafka:9092'],
    })

    const manager = new PM2Manager()
    const orm = await MikroORM.init<MariaDbDriver>(mikroConfig)
    const producer = kafka.producer()
    const consumer = kafka.consumer({
      groupId: 'runner',
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

    const shutdown = async () => {
      logger.info('Runner is shutting down...')

      await destroy()
      await manager.kill()
      await manager.disconnect()
      await consumer.disconnect()
      await producer.disconnect()
      await orm.close()
    }

    process.once('SIGUSR2', shutdown)
    process.once('SIGINT', shutdown)
    process.once('SIGTERM', shutdown)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
