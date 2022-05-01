import * as deepmerge from 'deepmerge'
import * as k8s from '@pulumi/kubernetes'
import { createIngress } from '../utils/ingress'
import { Configuration } from '../config'

export const deployment = (config: Configuration, provider?: k8s.Provider) =>
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
                    value: config.db.hostname,
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

export const service = (config: Configuration, provider?: k8s.Provider) =>
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

export const ingress = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.networking.v1.Ingress(
    'adminer-ingress',
    deepmerge(
      createIngress(
        config,
        [
          {
            path: '/',
            pathType: 'Prefix',
            backend: {
              service: {
                name: 'adminer',
                port: {
                  number: 8080,
                },
              },
            },
          },
        ],
        'adminer'
      ),
      {
        metadata: {
          name: 'ingress-adminer',
          namespace: 'rnd',
          labels: {
            www: 'ingress',
          },
        },
      }
    ),
    { provider }
  )
