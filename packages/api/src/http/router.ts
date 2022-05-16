import { Router } from 'express'
import { auth } from 'express-oauth2-jwt-bearer'
import { withErrorWrapper, fakeAuthCall } from '../utils/express'
import { ApplicationContext } from '../types'
import clientController from './controllers/client'
import config from '../config'

export function createRouter(ctx: ApplicationContext) {
  const gate = auth(config.auth)
  const client = clientController(ctx)
  const router = Router()
  const wrap = withErrorWrapper

  router.get('/client', gate, wrap(client.getClients))
  router.post('/client', gate, wrap(client.createClient))
  router.delete('/client/:uuid', gate, wrap(client.deleteClient))
  router.post('/client/:uuid/:action', gate, wrap(client.clientAction))

  router.ws('/logs', (ws, upgradeReq) =>
    fakeAuthCall(gate, upgradeReq, (error?: any) => {
      if (error) {
        ws.close(1011, 'Unauthorized')
      }
    })
  )

  return router
}
