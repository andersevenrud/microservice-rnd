import http from 'http'
import waitOn from 'wait-on'
import { Kafka } from 'kafkajs'
import { MikroORM } from '@mikro-orm/core'
import { MariaDbDriver } from '@mikro-orm/mariadb'
import { createHttpTerminator } from 'http-terminator'
import { createWinston } from './winston'
import { createApplication, createHealthCheck } from './app'
import mikroConfig from '../mikro-orm.config'
import config from './config'

async function main() {
  try {
    const health = await createHealthCheck()

    await waitOn(config.waitOn)

    const kafka = new Kafka(config.kafka)

    const orm = await MikroORM.init<MariaDbDriver>(mikroConfig)
    const producer = kafka.producer()

    const logger = createWinston(producer)

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

    health.ready()

    logger.info('API is running...')

    const shutdown = async (failure = false) => {
      logger.info('API is shutting down...')

      try {
        await health.destroy()

        // NOTE: This only applies to kubernetes as we want to the readiness probe to fail before actually stopping
        await new Promise((resolve) => {
          setTimeout(resolve, config.shutdown.delay)
        })

        await terminator.terminate()
        await producer.disconnect()
        await consumer.disconnect()
        await orm.close()
      } catch (e) {
        console.error('Exception on shutdown', e)
      } finally {
        process.exit(failure ? 1 : 0)
      }
    }

    process.once('SIGUSR2', () => shutdown())
    process.once('SIGINT', () => shutdown())
    process.once('SIGTERM', () => shutdown())

    // NOTE: Start late because this blocks the bootstrapping
    await subscribe(() => shutdown(true))
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
