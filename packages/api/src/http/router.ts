import { Router } from 'express'
import { withErrorWrapper, fakeAuthCall } from './utils'
import { ApplicationContext } from '../types'
import clientController from './controllers/client'

export function createRouter(ctx: ApplicationContext) {
  const client = clientController(ctx)
  const router = Router()
  const wrap = withErrorWrapper

  router.get('/client', ctx.gate, wrap(client.getClients))
  router.post('/client', ctx.gate, wrap(client.createClient))
  router.delete('/client/:uuid', ctx.gate, wrap(client.deleteClient))
  router.post('/client/:uuid/:action', ctx.gate, wrap(client.clientAction))

  router.ws('/logs', (ws, upgradeReq) =>
    fakeAuthCall(ctx.gate, upgradeReq, (error?: any) => {
      if (error) {
        ws.close(1011, 'Unauthorized')
      }
    })
  )

  return router
}
