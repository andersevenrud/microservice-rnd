import { Logger } from 'winston'
import { MikroORM } from '@mikro-orm/core'
import { Producer, Consumer } from 'kafkajs'
import { ClientInstance } from './entities'
import { PM2Manager } from './manager'

interface ApplicationContext {
  producer: Producer
  consumer: Consumer
  orm: MikroORM
  manager: PM2Manager
  logger: Logger
}

export async function createApplication({
  logger,
  manager,
  consumer,
  orm,
}: ApplicationContext) {
  const updateState = async (client: ClientInstance, state: string) => {
    const em = orm.em.fork()
    client.lastActiveAt = new Date()
    client.state = state
    await em.persistAndFlush(client)
  }

  const clients = await orm.em.fork().find(ClientInstance, {
    deletedAt: null,
  })

  await Promise.all(
    clients.map(async (client) => {
      try {
        logger.info('Trying to resume instance', { uuid: client.uuid })

        await updateState(client, 'starting')
        await manager.start(client.uuid)
      } catch (e) {
        const { message, stack } = e as Error
        logger.error(message, { client, stack })
      }
    })
  )

  await consumer.subscribe({ topic: 'clientAction' })
  await consumer.subscribe({ topic: 'clientMessage' })

  const interval = setInterval(async () => {
    try {
      const em = orm.em.fork()
      const list = await manager.list()
      const clients = await em.find(ClientInstance, {})
      const online = list
        .filter((item: any) => item.pm2_env?.status === 'online')
        .map((item: any) => item.name.split(':')[1])

      for (const client of clients) {
        client.online = online.includes(client.uuid)
        em.persist(client)
      }

      await em.flush()
    } catch (e) {
      console.error(e)
    }
  }, 2500)

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const msg = JSON.parse(message.value!.toString())
        const { action, args } = msg

        const client = await orm.em.fork().findOneOrFail(ClientInstance, {
          uuid: args.uuid,
        })

        switch (topic) {
          case 'clientMessage':
            switch (action) {
              case 'online':
              case 'ping':
                await updateState(client, 'started')
                break

              case 'offline':
                await updateState(client, 'stopped')
                break
            }
            break

          case 'clientAction':
            const isRunning = await manager.isRunning(client.uuid)

            logger.info(`Trying to ${action} instance`, {
              uuid: client.uuid,
              isRunning,
            })

            switch (action) {
              case 'start':
                if (!isRunning) {
                  await updateState(client, 'starting')
                  await manager.start(client.uuid)
                }
                break

              case 'stop':
                if (isRunning) {
                  await updateState(client, 'stopping')
                  await manager.stop(client.uuid)
                }
                break

              case 'delete':
                await updateState(client, 'deleting')
                await manager.delete(client.uuid)
                break

              case 'restart':
                if (isRunning) {
                  await updateState(client, 'restarting')
                  await manager.restart(client.uuid)
                }
                break
            }
            break
        }
      } catch (e) {
        const { message, stack } = e as Error
        logger.error('Runner consumer error', { message, stack })
        //throw e
      }
    },
  })

  return async () => {
    clearInterval(interval)
  }
}
