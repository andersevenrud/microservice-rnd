import { parse } from 'yaml'
import { Config } from '@pulumi/pulumi'

export interface Configuration {
  kubeConfig: any
  host: string
  appUrl: string
  mode: string
  name: string
  dev: boolean
  version: string
  sha: string
  db_storage_size: string
  kafka_storage_size: string
  zookeeper_storage_size: string
  keycloak_storage_size: string
  keycloak_db_storage_size: string
  keycloak_db: {
    name: string
    password: string
    username: string
  }
  keycloak: {
    hostname: string
    username: string
    password: string
    db_type: string
    db_url: string
    proxy: string
  }
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
  oauth: {
    issuerUrl: string
    audience: string
  }
}

export default function createConfig(config: Config): Configuration {
  const kubeConfigRaw = config.get('kubeconfig')
  const kubeConfig = kubeConfigRaw ? parse(kubeConfigRaw) : undefined
  const mode = config.get('mode') || 'development'
  const dev = mode === 'development'
  const name = config.get('name') || 'dev'
  const version = config.get('version') || 'latest'
  const sha = config.get('sha') || 'HEAD'
  const host = config.get('host') || 'rnd.lvh.me'
  const appUrl = config.get('app_url') || `https://${host}/`

  return {
    host,
    appUrl,
    dev,
    kubeConfig,
    mode,
    name,
    version,
    sha,
    db_storage_size: config.get('db_storage_size') || '1Gi',
    kafka_storage_size: config.get('kafka_storage_size') || '1Gi',
    zookeeper_storage_size: config.get('zookeeper_storage_size') || '1Gi',
    keycloak_storage_size: config.get('keycloak_storage_size') || '1Gi',
    keycloak_db_storage_size: config.get('keycloak_db_storage_size') || '1Gi',
    keycloak_db: {
      username: config.get('keycloak_db.username') || 'db',
      password: config.get('keycloak_db.password') || 'db',
      name: config.get('keycloak_db.name') || 'db',
    },
    keycloak: {
      hostname: config.get('keycloak.hostname') || `auth.${host}`,
      username: config.get('keycloak.username') || 'admin',
      password: config.get('keycloak.password') || 'admin',
      db_type: config.get('keycloak.db_type') || 'postgres',
      db_url:
        config.get('keycloak.db_url') || 'jdbc:postgresql://keycloak-db/db',
      proxy: config.get('keycloak.proxy') || 'edge',
    },
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
    oauth: {
      issuerUrl: `https://auth.${host}/realms/rnd`,
      audience: 'account',
    },
  }
}
