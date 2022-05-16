import waitOn from 'wait-on'
import nodemailer from 'nodemailer'
import { Kafka } from 'kafkajs'
import { createWinston } from './utils/winston'
import { useShutdown } from './utils/shutdown'
import { createConsumer } from './mail/sendmail'
import config from './config'

async function main() {
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
    })

    const shutdown = useShutdown(
      () => [
        () => logger.info('Mailer is shutting down...'),
        () => consumer.disconnect(),
        () => producer.disconnect(),
        () => transporter.close(),
      ],
      0 // FIXME
    )

    await producer.connect()
    await subscribe(() => shutdown(true))

    logger.info('Mailer is running...')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
