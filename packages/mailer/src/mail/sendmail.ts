import { Transporter } from 'nodemailer'
import { Logger } from 'winston'
import { Kafka } from 'kafkajs'
import { MessageContext } from './messages'
import { MailNotification, MailMetadata } from '../types'
import * as mail from './messages'
import config from '../config'

const messageTemplates: Record<
  string,
  (metadata: MailMetadata) => MessageContext
> = {
  welcome: mail.createWelcomeMessage,
}

export async function sendMail(
  transporter: Transporter,
  { to, template }: MailNotification,
  metadata: MailMetadata
) {
  if (messageTemplates[template]) {
    const { subject, html, text } = messageTemplates[template](metadata)

    await transporter.sendMail({
      from: metadata.from,
      to,
      subject,
      html,
      text,
    })
  } else {
    throw new Error(`Invalid email template '${template}'`)
  }
}

export function createConsumer({
  kafka,
  logger,
  transporter,
}: {
  kafka: Kafka
  logger: Logger
  transporter: Transporter
}) {
  const metadata = {
    from: config.from,
    appUrl: config.appUrl,
  }

  const consumer = kafka.consumer({
    groupId: 'mailer',
    allowAutoTopicCreation: false,
  })

  const subscribe = async (shutdown: () => void) => {
    await consumer.connect()
    await consumer.subscribe({ topic: 'mailNotification' })

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const msg = JSON.parse(message.value!.toString())

          switch (topic) {
            case 'mailNotification':
              logger.info('Sending email notification...')
              await sendMail(transporter, msg, metadata)
              break
          }
        } catch (e) {
          const { message, stack } = e as Error
          logger.error('Mailer consumer exception', { message, stack })
          //throw e
        }
      },
    })

    consumer.on(consumer.events.CRASH, ({ payload: { restart } }) => {
      if (!restart) {
        shutdown()
      }
    })
  }

  return { subscribe, consumer }
}
