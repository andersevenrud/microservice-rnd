import http from 'http'
import waitOn from 'wait-on'
import { Kafka } from 'kafkajs'
import { auth } from 'express-oauth2-jwt-bearer'
import { createHttpTerminator } from 'http-terminator'
import { createWinston } from './utils/winston'
import { createExpress } from './http/express'
import { createBroadcaster } from './http/broadcast'
import { createHealthCheck } from './http/health'
import { useShutdown } from './utils/shutdown'
import createMikroOrm from './db/mikro'
import config from './config'

async function main() {
  const shutdown = useShutdown(config.shutdown.delay)

  try {
    const health = await createHealthCheck()

    await waitOn(config.waitOn)

    const gate = auth(config.auth)
    const kafka = new Kafka(config.kafka)
    const orm = await createMikroOrm(config.db)
    const producer = kafka.producer()
    const logger = createWinston('api', producer)

    await producer.connect()
    await orm.connect()

    const ctx = {
      gate,
      producer,
      orm,
      logger,
      kafka,
    }

    const { app, wss } = createExpress(ctx)
    const { subscribe, consumer } = createBroadcaster(ctx, wss)

    const server = await new Promise<http.Server>((resolve, reject) => {
      const server = app.listen(8080, () => {
        resolve(server)
      })
      server.once('error', reject)
    })

    const terminator = createHttpTerminator({ server })

    shutdown.add(async () => {
      logger.info('API is shutting down...')
      await health.destroy()
    }, true)

    shutdown.add([
      () => terminator.terminate(),
      () => producer.disconnect(),
      () => consumer.disconnect(),
      () => orm.close(),
    ])

    health.ready()

    logger.info('API is running...')

    // NOTE: Start late because this blocks the bootstrapping
    await subscribe(() => shutdown.down(true))
  } catch (e) {
    console.error(e)
    shutdown.down(true)
  }
}

main()
