import { Config } from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import { kafkaEnv } from '../utils/env'

export const deployment = (config: Config, provider: k8s.Provider) =>
  new k8s.apps.v1.Deployment(
    'kowl-deployment',
    {
      metadata: {
        labels: {
          admin: 'kowl',
        },
        name: 'kowl',
        namespace: 'rnd',
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            admin: 'kowl-pod',
          },
        },
        template: {
          metadata: {
            labels: {
              admin: 'kowl-pod',
            },
          },
          spec: {
            restartPolicy: 'Always',
            containers: [
              {
                name: 'kowl',
                image: 'quay.io/cloudhut/kowl:master-ab6caaa',
                imagePullPolicy: 'IfNotPresent',
                ports: [
                  {
                    containerPort: 8080,
                  },
                ],
                env: [...kafkaEnv(config)],
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
    'kowl-service',
    {
      metadata: {
        labels: {
          admin: 'kowl',
        },
        name: 'kowl',
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
          admin: 'kowl-pod',
        },
      },
    },
    { provider }
  )
