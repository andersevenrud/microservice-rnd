import waitOn from 'wait-on'
import nodemailer, { Transporter } from 'nodemailer'
import { Kafka } from 'kafkajs'
import { createWinston } from './winston'
import { MessageContext } from './messages'
import { useShutdown } from './utils/shutdown'
import * as mail from './messages'
import config from './config'

interface MailNotification {
  to: string
  template: string
}

const messageTemplates: Record<string, () => MessageContext> = {
  welcome: mail.createWelcomeMessage,
}

async function sendMail(
  transporter: Transporter,
  { to, template }: MailNotification
) {
  if (messageTemplates[template]) {
    const { subject, html, text } = messageTemplates[template]()
    const from = config.from

    await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
    })
  } else {
    throw new Error(`Invalid email template '${template}'`)
  }
}

async function main() {
  try {
    await waitOn(config.waitOn)

    const kafka = new Kafka(config.kafka)
    const transporter = nodemailer.createTransport(config.mailer)
    const producer = kafka.producer()
    const consumer = kafka.consumer({
      groupId: 'mailer',
      allowAutoTopicCreation: false,
    })

    const logger = createWinston('mailer', producer)

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
    await consumer.connect()
    await consumer.subscribe({ topic: 'mailNotification' })

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const msg = JSON.parse(message.value!.toString())

          switch (topic) {
            case 'mailNotification':
              logger.info('Sending email notification...')
              await sendMail(transporter, msg)
              break
          }
        } catch (e) {
          const { message, stack } = e as Error
          logger.error('Mailer consumer exception', { message, stack })
          //throw e
        }
      },
    })

    logger.info('Mailer is running...')

    consumer.on(consumer.events.CRASH, ({ payload: { restart } }) => {
      if (!restart) {
        shutdown(true)
      }
    })
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
