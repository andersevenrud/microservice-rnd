import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import expressWs from 'express-ws'
import express, { Request, Response, NextFunction } from 'express'
import { auth } from 'express-oauth2-jwt-bearer'
import { Kafka, Producer, CompressionTypes } from 'kafkajs'
import { Logger } from 'winston'
import { MikroORM } from '@mikro-orm/core'
import { RequestContext } from '@mikro-orm/core'
import { ClientInstance } from './entities'
import config from './config'

export interface ApplicationContext {
  logger: Logger
  producer: Producer
  orm: MikroORM
  kafka: Kafka
}

class ExpressError extends Error {
  status = 500
}

class ExpressNotFoundError extends ExpressError {
  status = 404
}

const auther = auth({
  ...config.auth,
})

const withErrorWrapper =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (e) {
      next(e)
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
    auther,
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
    auther,
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
    auther,
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
    auther,
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

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(express.json())
  app.use(cookieParser())

  app.use((_, __, next) => {
    RequestContext.create(ctx.orm.em, next)
  })

  app.ws('/logs', (ws, upgradeReq) => {
    // FIXME: This is just a hack to get authentication on the websocket via JWT.
    auther(
      {
        ...upgradeReq,
        headers: {
          authorization: `Bearer ${upgradeReq.cookies.rnd_token}`,
        },
        is: () => false,
      } as any,
      {} as any,
      (error?: any) => {
        if (error) {
          ws.close(1011, 'Unauthorized')
        }
      }
    )
  })

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
  const { kafka } = ctx
  const { app, wss } = createExpress(ctx)

  const broadcast = (data: string) =>
    Array.from(wss.clients)
      .filter((client) => client.readyState === 1)
      .forEach((client) => client.send(data))

  const consumer = kafka.consumer({
    groupId: `api-logging-proxy-${process.env.HOSTNAME}`,
    allowAutoTopicCreation: false,
  })

  const subscribe = async (shutdown: () => void) => {
    await consumer.connect()
    await consumer.subscribe({ topic: 'logs' })
    await consumer.subscribe({ topic: 'clientState' })

    await consumer.run({
      eachMessage: async ({ topic, message: { timestamp, value } }) => {
        if (value) {
          const data = JSON.parse(value.toString())
          broadcast(
            JSON.stringify({
              topic,
              timestamp,
              data,
            })
          )
        }
      },
    })

    consumer.on(consumer.events.CRASH, ({ payload: { restart } }) => {
      if (!restart) {
        shutdown()
      }
    })
  }

  return { app, subscribe, consumer }
}

export async function createHealthCheck() {
  let ready = false

  const app = express()

  app.get('/readyz', (_, res) => {
    res.status(ready ? 200 : 500).end()
  })

  app.get('/livez', (_, res) => {
    res.status(ready ? 200 : 500).end()
  })

  const server = app.listen(8081)

  return {
    async ready() {
      ready = true
    },
    async destroy() {
      ready = false
      server.close()
    },
  }
}
