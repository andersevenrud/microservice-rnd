import { Request, Response } from 'express'
import { Producer, CompressionTypes } from 'kafkajs'
import { RequestContext } from '@mikro-orm/core'
import { ClientInstance } from '../../entities'
import { ApplicationContext } from '../../types'

const createPublisher = (producer: Producer) => (topic: string, value: any) =>
  producer.send({
    topic,
    compression: CompressionTypes.GZIP,
    messages: [
      {
        value: JSON.stringify(value),
      },
    ],
  })

export default function createController({ producer }: ApplicationContext) {
  const publish = createPublisher(producer)

  const publishClientAction = async (action: string, client: ClientInstance) =>
    publish('clientAction', {
      action,
      args: { uuid: client.uuid },
    })

  const publishEmailNotification = async (to: string) =>
    publish('mailNotification', {
      template: 'welcome',
      to,
    })

  return {
    async getClients(req: Request, res: Response) {
      const em = RequestContext.getEntityManager()!
      const list = await em.find(ClientInstance, {
        deletedAt: null,
      })

      res.json(list)
    },

    async createClient(req: Request, res: Response) {
      const em = RequestContext.getEntityManager()!
      const client = new ClientInstance()

      await em.persistAndFlush(client)
      await publishClientAction('start', client)
      await publishEmailNotification('user@email.net')

      res.send('OK')
    },

    async deleteClient(req: Request, res: Response) {
      const em = RequestContext.getEntityManager()!
      const client = await em.findOneOrFail(ClientInstance, {
        uuid: req.params.uuid,
        deletedAt: null,
      })

      client.deletedAt = new Date()

      await em.persistAndFlush(client)
      await publishClientAction('delete', client)

      res.send('OK')
    },

    async clientAction(req: Request, res: Response) {
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
    },
  }
}
