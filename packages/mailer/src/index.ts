import waitOn from 'wait-on'
import nodemailer, { Transporter } from 'nodemailer'
import { Kafka } from 'kafkajs'
import { createWinston } from './winston'
import { MessageContext } from './messages'
import * as mail from './messages'

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
    const from = 'no-reply@mailer.app'

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
    await waitOn({
      resources: ['tcp:kafka:9092', 'tcp:mailhog:1025'],
    })

    const kafka = new Kafka({
      clientId: 'runner',
      brokers: ['kafka:9092'],
    })

    const transporter = nodemailer.createTransport({
      host: 'mailhog',
      port: 1025,
      secure: false,
    })

    const producer = kafka.producer()
    const consumer = kafka.consumer({ groupId: 'mailer' })
    const logger = createWinston('mailer', producer)

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

    const shutdown = async () => {
      logger.info('Mailer is shutting down...')

      await consumer.disconnect()
      await producer.disconnect()
      transporter.close()
    }

    process.once('SIGUSR2', shutdown)
    process.once('SIGINT', shutdown)
    process.once('SIGTERM', shutdown)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
