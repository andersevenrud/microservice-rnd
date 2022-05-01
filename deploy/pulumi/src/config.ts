import { parse } from 'yaml'
import { Config } from '@pulumi/pulumi'

export interface Configuration {
  kubeConfig: any
  host: string
  appUrl: string
  mode: string
  dev: boolean
  version: string
  sha: string
  db_storage_size: string
  kafka_storage_size: string
  zookeeper_storage_size: string
  db: {
    hostname: string
    name: string
    password: string
    username: string
  }
  mailer: {
    hostname: string
    port: string
  }
  kafka: {
    brokers: string
  }
}

export default function createConfig(config: Config): Configuration {
  const kubeConfigRaw = config.get('kubeconfig')
  const kubeConfig = kubeConfigRaw ? parse(kubeConfigRaw) : undefined
  const mode = config.get('mode') || 'dev'
  const dev = mode === 'dev'
  const version = config.get('version') || 'latest'
  const sha = config.get('sha') || 'HEAD'
  const host = config.get('host') || 'rnd.lvh.me'
  const appUrl = config.get('env.APP_URL') || 'http://rnd.lvh.me/'

  return {
    host,
    appUrl,
    dev,
    kubeConfig,
    mode,
    version,
    sha,
    db_storage_size: config.get('db_storage_size') || '1Gi',
    kafka_storage_size: config.get('kafka_storage_size') || '1Gi',
    zookeeper_storage_size: config.get('zookeeper_storage_size') || '1Gi',
    db: {
      hostname: config.get('env.DB_HOSTNAME') || 'db',
      name: config.get('env.DB_NAME') || 'db',
      password: config.get('env.DB_PASSWORD') || 'db',
      username: config.get('env.DB_USERNAME') || 'db',
    },
    mailer: {
      hostname: config.get('env.MAILER_HOST') || 'mailhog',
      port: config.get('env.MAILER_PORT') || '1025',
    },
    kafka: {
      brokers: config.get('env.KAFKA_BROKERS') || 'kafka:9092',
    },
  }
}
