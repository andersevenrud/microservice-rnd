import http from 'http'
import waitOn from 'wait-on'
import { Kafka } from 'kafkajs'
import { MikroORM } from '@mikro-orm/core'
import { MariaDbDriver } from '@mikro-orm/mariadb'
import { createHttpTerminator } from 'http-terminator'
import { createWinston } from './utils/winston'
import { createApplication, createHealthCheck } from './app'
import { useShutdown } from './utils/shutdown'
import mikroConfig from '../mikro-orm.config'
import config from './config'

async function main() {
  try {
    const health = await createHealthCheck()

    await waitOn(config.waitOn)

    const kafka = new Kafka(config.kafka)
    const orm = await MikroORM.init<MariaDbDriver>(mikroConfig)
    const producer = kafka.producer()
    const logger = createWinston('api', producer)

    await producer.connect()
    await orm.connect()

    const { app, subscribe, consumer } = await createApplication({
      producer,
      orm,
      logger,
      kafka,
    })

    const server = await new Promise<http.Server>((resolve, reject) => {
      const server = app.listen(8080, () => {
        resolve(server)
      })
      server.once('error', reject)
    })

    const terminator = createHttpTerminator({ server })

    const shutdown = useShutdown(
      () => [
        async () => {
          logger.info('API is shutting down...')
          await health.destroy()
        },
        () => terminator.terminate(),
        () => producer.disconnect(),
        () => consumer.disconnect(),
        () => orm.close(),
      ],
      config.shutdown.delay
    )

    health.ready()

    logger.info('API is running...')

    // NOTE: Start late because this blocks the bootstrapping
    await subscribe(() => shutdown(true))
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
