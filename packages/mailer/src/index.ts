import waitOn from 'wait-on'
import nodemailer from 'nodemailer'
import { Kafka } from 'kafkajs'
import { createWinston } from './utils/winston'
import { useShutdown } from './utils/shutdown'
import { createConsumer } from './mail/sendmail'
import config from './config'

async function main() {
  const shutdown = useShutdown()

  try {
    await waitOn(config.waitOn)

    const kafka = new Kafka(config.kafka)
    const transporter = nodemailer.createTransport(config.mailer)
    const producer = kafka.producer()

    const logger = createWinston('mailer', producer)

    const { consumer, subscribe } = createConsumer({
      kafka,
      logger,
      transporter,
      metadata: {
        from: config.from,
        appUrl: config.appUrl,
      },
    })

    shutdown.add([
      () => logger.info('Mailer is shutting down...'),
      () => consumer.disconnect(),
      () => producer.disconnect(),
      () => transporter.close(),
    ])

    await producer.connect()
    await subscribe(() => shutdown.down(true))

    logger.info('Mailer is running...')
  } catch (e) {
    console.error(e)
    shutdown.down(true)
  }
}

main()
