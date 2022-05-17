import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import expressWs from 'express-ws'
import express, { Request, Response, NextFunction } from 'express'
import { RequestContext } from '@mikro-orm/core'
import { ExpressError, ExpressNotFoundError } from './errors'
import { ApplicationContext } from '../types'
import { createRouter } from './router'

export function createExpress(ctx: ApplicationContext) {
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
