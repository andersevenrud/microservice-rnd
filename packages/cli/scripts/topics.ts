import waitOn from 'wait-on'
import { Kafka, ConfigResourceTypes } from 'kafkajs'
import config from '../src/config'

const topics = [
  {
    topic: 'clientState',
    configEntries: [
      {
        name: 'retention.ms',
        value: '604800000',
      },
    ],
  },
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
    configEntries: [],
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
]

async function main() {
  try {
    await waitOn({
      resources: config.kafka.brokers.map((str) => `tcp:${str}`),
      log: true,
      timeout: 60 * 1000,
    })

    const kafka = new Kafka(config.kafka)

    const admin = kafka.admin()

    await admin.connect()

    const found = await admin.fetchTopicMetadata()

    const updates = []
    const creations = []

    for (const topic of topics) {
      const foundTopic = found.topics.find((t) => t.name === topic.topic)
      if (foundTopic) {
        updates.push(topic)
      } else {
        creations.push(topic)
      }
    }

    console.info('Creating', creations.length, 'topics')
    console.info('Updating', creations.length, 'topics')

    if (creations.length > 0) {
      await admin.createTopics({
        topics: creations,
      })
    }

    if (updates.length > 0) {
      await admin.alterConfigs({
        validateOnly: false,
        resources: updates.map(({ topic, configEntries }) => ({
          type: ConfigResourceTypes.TOPIC,
          name: topic,
          configEntries,
        })),
      })
    }

    await admin.disconnect()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
