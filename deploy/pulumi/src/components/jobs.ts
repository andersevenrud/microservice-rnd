import * as k8s from '@pulumi/kubernetes'
import { dbEnv, kafkaEnv } from '../utils/env'
import { githubImage } from '../utils/image'
import { Configuration } from '../config'

export const cleanup = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.batch.v1.CronJob(
    'cleanup-job',
    {
      metadata: {
        labels: {
          job: 'cleanup',
        },
        name: 'cleanup',
        namespace: 'rnd',
      },
      spec: {
        successfulJobsHistoryLimit: 0,
        failedJobsHistoryLimit: 0,
        schedule: '0 * * * *',
        jobTemplate: {
          spec: {
            template: {
              spec: {
                restartPolicy: 'OnFailure',
                containers: [
                  {
                    name: 'cli',
                    image: githubImage(config, 'cli'),
                    command: ['npm', 'run', 'cleanup'],
                    env: [...dbEnv(config), ...kafkaEnv(config)],
                  },
                ],
              },
            },
          },
        },
      },
    },
    { provider }
  )

export const dbMigrations = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.batch.v1.Job(
    'db-migration-job',
    {
      metadata: {
        labels: {
          job: 'migrations',
        },
        name: 'db-migrations',
        namespace: 'rnd',
      },
      spec: {
        template: {
          spec: {
            restartPolicy: 'OnFailure',
            containers: [
              {
                name: 'cli-db-migrations',
                image: githubImage(config, 'cli'),
                command: ['npm', 'run', 'migrate'],
                env: [...dbEnv(config), ...kafkaEnv(config)],
              },
            ],
          },
        },
      },
    },
    { provider }
  )

export const topicMigrations = (
  config: Configuration,
  provider?: k8s.Provider
) =>
  new k8s.batch.v1.Job(
    'topic-migration-job',
    {
      metadata: {
        labels: {
          job: 'migrations',
        },
        name: 'topic-migrations',
        namespace: 'rnd',
      },
      spec: {
        template: {
          spec: {
            restartPolicy: 'OnFailure',
            containers: [
              {
                name: 'cli-topic-migrations',
                image: githubImage(config, 'cli'),
                command: ['npm', 'run', 'topics'],
                env: [...dbEnv(config), ...kafkaEnv(config)],
              },
            ],
          },
        },
      },
    },
    { provider }
  )

export const keycloakMigrations = (
  config: Configuration,
  provider?: k8s.Provider
) =>
  new k8s.batch.v1.Job(
    'keycloak-migration-job',
    {
      metadata: {
        labels: {
          job: 'migrations',
        },
        name: 'keycloak-migrations',
        namespace: 'rnd',
      },
      spec: {
        template: {
          spec: {
            restartPolicy: 'OnFailure',
            containers: [
              {
                name: 'cli-keycloak-migrations',
                image: githubImage(config, 'cli'),
                command: ['npm', 'run', 'keycloak'],
                env: [
                  {
                    name: 'KEYCLOAK_URL',
                    value: 'http://keycloak:8080',
                  },
                  {
                    name: 'KEYCLOAK_USERNAME',
                    value: config.keycloak.username,
                  },
                  {
                    name: 'KEYCLOAK_PASSWORD',
                    value: config.keycloak.password,
                  },
                  {
                    name: 'KEYCLOAK_REALM',
                    value: 'rnd',
                  },
                ],
              },
            ],
          },
        },
      },
    },
    { provider }
  )
