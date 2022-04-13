import minimist from 'minimist'
import { Kafka, CompressionTypes } from 'kafkajs'
import { createWinston } from './winston'

async function main() {
  try {
    const { uuid } = minimist(process.argv.slice(2))

    const kafka = new Kafka({
      clientId: 'kafka',
      brokers: ['kafka:9092'],
    })

    const producer = kafka.producer()
    const consumer = kafka.consumer({ groupId: 'instance' })
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

    await consumer.connect()
    await producer.connect()

    logger.info('Instance is running...', { uuid })

    await sendMessage('online')

    const interval = setInterval(() => sendMessage('ping'), 30 * 1000)

    const shutdown = async () => {
      logger.info('Instance is shutting down...', { uuid })

      clearInterval(interval)
      await sendMessage('offline')
      await consumer.disconnect()
      await producer.disconnect()
    }

    process.once('SIGUSR2', shutdown)
    process.once('SIGINT', shutdown)

    // NOTE: These interfer with PM2
    //process.once('SIGTERM', shutdown)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
