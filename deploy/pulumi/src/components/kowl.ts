import * as deepmerge from 'deepmerge'
import * as k8s from '@pulumi/kubernetes'
import { kafkaEnv } from '../utils/env'
import { createIngress } from '../utils/ingress'
import { Configuration } from '../config'

export const deployment = (config: Configuration, provider?: k8s.Provider) =>
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

export const service = (config: Configuration, provider?: k8s.Provider) =>
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

export const ingress = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.networking.v1.Ingress(
    'kowl-ingress',
    deepmerge(
      createIngress(
        config,
        [
          {
            path: '/',
            pathType: 'Prefix',
            backend: {
              service: {
                name: 'kowl',
                port: {
                  number: 8080,
                },
              },
            },
          },
        ],
        'kowl'
      ),
      {
        metadata: {
          name: 'ingress-kowl',
          namespace: 'rnd',
          labels: {
            www: 'ingress',
          },
        },
      }
    ),
    { provider }
  )
