import minimist from 'minimist'
import { Kafka, CompressionTypes } from 'kafkajs'
import { createWinston } from './utils/winston'
import { useShutdown } from './utils/shutdown'
import config from './config'

async function main() {
  const shutdown = useShutdown(0, ['SIGUSR2', 'SIGINT'])

  try {
    const { uuid } = minimist(process.argv.slice(2))

    const kafka = new Kafka({
      ...config.kafka,
      clientId: 'instance',
    })

    const producer = kafka.producer()
    const consumer = kafka.consumer({
      groupId: 'instance',
      allowAutoTopicCreation: false,
    })
    const logger = createWinston(`instance-${uuid}`, producer)

    const sendMessage = (action: string) =>
      producer.send({
        topic: 'clientMessage',
        compression: CompressionTypes.GZIP,
        messages: [
          {
            value: JSON.stringify({
              action,
              args: { date: new Date().toISOString(), uuid },
            }),
          },
        ],
      })

    let interval: NodeJS.Timer

    shutdown.add([
      () => {
        logger.info('Instance is shutting down...', { uuid })
        clearInterval(interval)
      },
      () => sendMessage('offline'),
      () => consumer.disconnect(),
      () => producer.disconnect(),
    ])

    await consumer.connect()
    await producer.connect()
    await sendMessage('online')

    logger.info('Instance is running...', { uuid })

    interval = setInterval(() => sendMessage('ping'), 30 * 1000)
  } catch (e) {
    console.error(e)
    shutdown.down(true)
  }
}

main()
