import { Config } from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'

export const deployment = (config: Config, provider: k8s.Provider) =>
  new k8s.apps.v1.Deployment(
    'adminer-deployment',
    {
      metadata: {
        labels: {
          admin: 'adminer',
        },
        name: 'adminer',
        namespace: 'rnd',
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            admin: 'adminer-pod',
          },
        },
        template: {
          metadata: {
            labels: {
              admin: 'adminer-pod',
            },
          },
          spec: {
            restartPolicy: 'Always',
            containers: [
              {
                name: 'adminer',
                image: 'adminer:4.8.1',
                ports: [
                  {
                    containerPort: 8080,
                  },
                ],
                env: [
                  {
                    name: 'ADMINER_DEFAULT_SERVER',
                    value: config.get('DB_HOSTNAME') || 'db',
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

export const service = (config: Config, provider: k8s.Provider) =>
  new k8s.core.v1.Service(
    'adminer-service',
    {
      metadata: {
        labels: {
          admin: 'adminer',
        },
        name: 'adminer',
        namespace: 'rnd',
      },
      spec: {
        clusterIP: 'None',
        ports: [
          {
            port: 8080,
          },
        ],
        selector: {
          admin: 'adminer-pod',
        },
      },
    },
    { provider }
  )
