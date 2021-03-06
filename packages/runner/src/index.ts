import waitOn from 'wait-on'
import { Kafka } from 'kafkajs'
import { createApplication } from './app'
import { PM2Manager } from './manager'
import { createWinston } from './services/winston'
import { useShutdown } from './utils/shutdown'
import createMikroOrm from './db/mikro'
import config from './config'

async function main() {
  const shutdown = useShutdown()

  try {
    await waitOn(config.waitOn)

    const kafka = new Kafka(config.kafka)
    const manager = new PM2Manager()
    const orm = await createMikroOrm(config.db)
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

    shutdown.add([
      () => logger.info('Runner is shutting down...'),
      () => destroy(),
      () => manager.kill(),
      () => manager.disconnect(),
      () => consumer.disconnect(),
      () => producer.disconnect(),
      () => orm.close(),
    ])

    consumer.on(consumer.events.CRASH, ({ payload: { restart } }) => {
      if (!restart) {
        shutdown.down(true)
      }
    })
  } catch (e) {
    console.error(e)
    shutdown.down(true)
  }
}

main()
