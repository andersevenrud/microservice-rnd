import waitOn from 'wait-on'
import { Kafka } from 'kafkajs'

async function main() {
  try {
    await waitOn({
      resources: ['tcp:kafka:9092'],
    })

    const kafka = new Kafka({
      clientId: 'api',
      brokers: ['kafka:9092'],
    })

    const admin = kafka.admin()

    await admin.connect()

    await admin.createTopics({
      topics: [
        {
          topic: 'clientAction',
          configEntries: [
            {
              name: 'retention.ms',
              value: '604800000',
            },
          ],
        },
        {
          topic: 'clientMessage',
          configEntries: [
            {
              name: 'retention.ms',
              value: '604800000',
            },
          ],
        },
        {
          topic: 'logs',
        },
        {
          topic: 'mailNotification',
          configEntries: [
            {
              name: 'retention.ms',
              value: '604800000',
            },
          ],
        },
      ],
    })

    await admin.disconnect()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
