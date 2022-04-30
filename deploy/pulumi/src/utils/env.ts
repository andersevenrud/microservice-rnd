import { Config } from '@pulumi/pulumi'

export const dbEnv = (config: Config) => [
  {
    name: 'DB_HOSTNAME',
    value: config.get('DB_HOSTNAME') || 'db',
  },
  {
    name: 'DB_NAME',
    value: config.get('DB_NAME') || 'db',
  },
  {
    name: 'DB_PASSWORD',
    value: config.get('DB_PASSWORD') || 'db',
  },
  {
    name: 'DB_USERNAME',
    value: config.get('DB_USERNAME') || 'db',
  },
]

export const kafkaEnv = (config: Config) => [
  {
    name: 'KAFKA_BROKERS',
    value: config.get('KAFKA_BROKERS') || 'kafka:9092',
  },
]

export const mailerEnv = (config: Config) => [
  {
    name: 'MAILER_HOST',
    value: 'mailhog',
  },
  {
    name: 'MAILER_PORT',
    value: '1025',
  },
]
