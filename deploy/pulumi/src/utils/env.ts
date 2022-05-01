import { Configuration } from '../config'

export const dbEnv = (config: Configuration) => [
  {
    name: 'DB_HOSTNAME',
    value: config.db.hostname,
  },
  {
    name: 'DB_NAME',
    value: config.db.name,
  },
  {
    name: 'DB_PASSWORD',
    value: config.db.password,
  },
  {
    name: 'DB_USERNAME',
    value: config.db.username,
  },
]

export const kafkaEnv = (config: Configuration) => [
  {
    name: 'KAFKA_BROKERS',
    value: config.kafka.brokers,
  },
]

export const mailerEnv = (config: Configuration) => [
  {
    name: 'MAILER_HOST',
    value: config.mailer.hostname,
  },
  {
    name: 'MAILER_PORT',
    value: config.mailer.port,
  },
]
