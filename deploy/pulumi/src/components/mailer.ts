import { Config } from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import { kafkaEnv, mailerEnv } from '../utils/env'
import { githubImage } from '../utils/image'

export const deployment = (config: Config, provider: k8s.Provider) =>
  new k8s.apps.v1.Deployment(
    'mailer-deployment',
    {
      metadata: {
        labels: {
          app: 'mailer',
        },
        name: 'mailer',
        namespace: 'rnd',
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'mailer-pod',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'mailer-pod',
            },
          },
          spec: {
            restartPolicy: 'Always',
            containers: [
              {
                name: 'mailer',
                image: githubImage(config, 'mailer'),
                imagePullPolicy: 'Always',
                ports: [
                  {
                    containerPort: 8080,
                  },
                ],
                env: [
                  {
                    name: 'APP_URL',
                    value: 'http://rnd.lvh.me/',
                  },
                  ...kafkaEnv(config),
                  ...mailerEnv(config),
                ],
              },
            ],
          },
        },
      },
    },
    { provider }
  )
