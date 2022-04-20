import { Logger } from 'winston'
import { MikroORM } from '@mikro-orm/core'
import { Producer, Consumer, CompressionTypes } from 'kafkajs'
import { ClientInstance } from './entities'
import { PM2Manager } from './manager'

interface ApplicationContext {
  producer: Producer
  consumer: Consumer
  orm: MikroORM
  manager: PM2Manager
  logger: Logger
}

const stateUpdater =
  ({ orm, producer }: ApplicationContext) =>
  async (client: ClientInstance, state: string) => {
    const oldState = client.state
    const em = orm.em.fork()
    client.lastActiveAt = new Date()
    client.state = state
    await em.persistAndFlush(client)

    if (oldState !== state) {
      await producer.send({
        topic: 'clientState',
        compression: CompressionTypes.GZIP,
        messages: [
          {
            value: JSON.stringify({
              state,
              args: { uuid: client.uuid },
            }),
          },
        ],
      })
    }
  }

async function createConsumer(ctx: ApplicationContext) {
  const { consumer, logger, orm, manager } = ctx
  const updateState = stateUpdater(ctx)

  await consumer.subscribe({ topic: 'clientAction' })
  await consumer.subscribe({ topic: 'clientMessage' })

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
}

async function resumeClients(ctx: ApplicationContext) {
  const { orm, logger, manager } = ctx
  const updateState = stateUpdater(ctx)

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
}

async function checkClientHealth({
  orm,
  producer,
  manager,
}: ApplicationContext) {
  try {
    const em = orm.em.fork()
    const list = await manager.list()
    const clients = await em.find(ClientInstance, {})
    const online = list
      .filter((item: any) => item.pm2_env?.status === 'online')
      .map((item: any) => item.name.split(':')[1])

    const messages = []
    for (const client of clients) {
      const isOnline = online.includes(client.uuid)
      if (client.online !== isOnline) {
        messages.push({
          value: JSON.stringify({
            online: isOnline,
            args: { uuid: client.uuid },
          }),
        })
      }
      client.online = isOnline
      em.persist(client)
    }

    await em.flush()

    await producer.send({
      topic: 'clientState',
      compression: CompressionTypes.GZIP,
      messages,
    })
  } catch (e) {
    console.error(e)
  }
}

export async function createApplication(ctx: ApplicationContext) {
  const interval = setInterval(() => checkClientHealth(ctx), 2500)

  await resumeClients(ctx)
  await createConsumer(ctx)

  return async () => {
    clearInterval(interval)
  }
}
