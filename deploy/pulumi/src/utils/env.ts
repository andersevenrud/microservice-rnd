import { Config } from '@pulumi/pulumi'

export const dbEnv = (config: Config) => [
  {
    name: 'DB_HOSTNAME',
    value: config.get('env.DB_HOSTNAME') || 'db',
  },
  {
    name: 'DB_NAME',
    value: config.get('env.DB_NAME') || 'db',
  },
  {
    name: 'DB_PASSWORD',
    value: config.get('env.DB_PASSWORD') || 'db',
  },
  {
    name: 'DB_USERNAME',
    value: config.get('env.DB_USERNAME') || 'db',
  },
]

export const kafkaEnv = (config: Config) => [
  {
    name: 'KAFKA_BROKERS',
    value: config.get('env.KAFKA_BROKERS') || 'kafka:9092',
  },
]

export const mailerEnv = (config: Config) => [
  {
    name: 'MAILER_HOST',
    value: config.get('env.MAILER_HOST') || 'mailhog',
  },
  {
    name: 'MAILER_PORT',
    value: config.get('env.MAILER_PORT') || '1025',
  },
]
