import * as k8s from '@pulumi/kubernetes'
import { dbEnv, kafkaEnv } from '../utils/env'
import { githubImage } from '../utils/image'
import { Configuration } from '../config'

export const deployment = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.apps.v1.Deployment(
    'runner-deployment',
    {
      metadata: {
        labels: {
          app: 'runner',
          version: config.version,
          sha: config.sha,
        },
        name: 'runner',
        namespace: 'rnd',
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'runner-pod',
          },
        },
        strategy: {},
        template: {
          metadata: {
            labels: {
              app: 'runner-pod',
            },
          },
          spec: {
            restartPolicy: 'Always',
            containers: [
              {
                name: 'runner',
                image: githubImage(config, 'runner'),
                imagePullPolicy: 'Always',
                ports: [
                  {
                    containerPort: 8080,
                  },
                ],
                env: [...dbEnv(config), ...kafkaEnv(config)],
              },
            ],
          },
        },
      },
    },
    { provider }
  )
