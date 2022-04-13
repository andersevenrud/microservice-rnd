import expressWs from 'express-ws'
import express, { Request, Response, NextFunction } from 'express'
import { Consumer, Producer, CompressionTypes } from 'kafkajs'
import { Logger } from 'winston'
import { MikroORM } from '@mikro-orm/core'
import { RequestContext } from '@mikro-orm/core'
import { ClientInstance } from './entities'

export interface ApplicationContext {
  logger: Logger
  producer: Producer
  consumer: Consumer
  orm: MikroORM
}

class ExpressError extends Error {
  status = 500
}

class ExpressNotFoundError extends ExpressError {
  status = 404
}

const withErrorWrapper = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (e) {
      next(e)
    }
  }
}

function createRouter({ producer }: ApplicationContext) {
  const router = express.Router()

  const publishClientAction = async (action: string, client: ClientInstance) =>
    producer.send({
      topic: 'clientAction',
      compression: CompressionTypes.GZIP,
      messages: [
        {
          value: JSON.stringify({
            action,
            args: { uuid: client.uuid },
          }),
        },
      ],
    })

  const publishEmailNotification = async (to: string) =>
    producer.send({
      topic: 'mailNotification',
      compression: CompressionTypes.GZIP,
      messages: [
        {
          value: JSON.stringify({
            template: 'welcome',
            to,
          }),
        },
      ],
    })

  router.get(
    '/client',
    withErrorWrapper(async (req: Request, res: Response) => {
      const em = RequestContext.getEntityManager()!
      const list = await em.find(ClientInstance, {
        deletedAt: null,
      })

      res.json(list)
    })
  )

  router.post(
    '/client',
    withErrorWrapper(async (req: Request, res: Response) => {
      const em = RequestContext.getEntityManager()!
      const client = new ClientInstance()

      await em.persistAndFlush(client)
      await publishClientAction('start', client)
      await publishEmailNotification('user@email.net')

      res.send('OK')
    })
  )

  router.delete(
    '/client/:uuid',
    withErrorWrapper(async (req: Request, res: Response) => {
      const em = RequestContext.getEntityManager()!
      const client = await em.findOneOrFail(ClientInstance, {
        uuid: req.params.uuid,
        deletedAt: null,
      })

      client.deletedAt = new Date()

      await em.persistAndFlush(client)
      await publishClientAction('delete', client)

      res.send('OK')
    })
  )

  router.post(
    '/client/:uuid/:action',
    withErrorWrapper(async (req: Request, res: Response) => {
      const { uuid, action } = req.params
      if (!['start', 'stop', 'restart'].includes(action)) {
        throw new TypeError(`Invalid action '${action}'`)
      }

      const em = RequestContext.getEntityManager()!
      const client = await em.findOneOrFail(ClientInstance, {
        uuid,
      })

      await publishClientAction(action, client)

      res.send('OK')
    })
  )

  return router
}

function createExpress(ctx: ApplicationContext) {
  const app = express() as unknown as expressWs.Application
  const ews = expressWs(app)
  const wss = ews.getWss()
  const router = createRouter(ctx)

  app.use(express.json())

  app.use((_, __, next) => {
    RequestContext.create(ctx.orm.em, next)
  })

  app.ws('/logs', (ws, req) => {})

  app.use(router)

  app.use((_, __, next) => {
    next(new ExpressNotFoundError('Not found'))
  })

  app.use(
    (err: ExpressError, req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) {
        next(err)
      } else {
        res.status(err.status || 500).send(err.message)
      }
    }
  )

  return { app, wss }
}

export async function createApplication(ctx: ApplicationContext) {
  const { app, wss } = createExpress(ctx)

  const broadcast = (data: Buffer) =>
    Array.from(wss.clients)
      .filter((client) => client.readyState === 1)
      .forEach((client) => client.send(data, { binary: true }))

  const subscribe = async () => {
    await ctx.consumer.subscribe({ topic: 'logs' })

    await ctx.consumer.run({
      eachMessage: async ({ message: { value } }) => {
        if (value) {
          broadcast(value)
        }
      },
    })
  }

  return { app, subscribe }
}
