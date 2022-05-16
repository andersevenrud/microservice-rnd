import { Server } from 'ws'
import { ApplicationContext } from '../types'

export function createBroadcaster({ kafka }: ApplicationContext, wss: Server) {
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

  return {
    subscribe,
    consumer,
  }
}
