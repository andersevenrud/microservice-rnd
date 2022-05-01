import * as deepmerge from 'deepmerge'
import * as k8s from '@pulumi/kubernetes'
import { createIngress } from '../utils/ingress'
import { Configuration } from '../config'

export const deployment = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.apps.v1.Deployment(
    'mailhog-deployment',
    {
      metadata: {
        labels: {
          admin: 'mailhog',
        },
        name: 'mailhog',
        namespace: 'rnd',
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            admin: 'mailhog-pod',
          },
        },
        template: {
          metadata: {
            labels: {
              admin: 'mailhog-pod',
            },
          },
          spec: {
            restartPolicy: 'Always',
            containers: [
              {
                name: 'mailhog',
                image: 'mailhog/mailhog:v1.0.1',
                imagePullPolicy: 'IfNotPresent',
                ports: [
                  {
                    name: 'smtp',
                    containerPort: 1025,
                  },
                  {
                    name: 'http',
                    containerPort: 8025,
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
    'mailhog-service',
    {
      metadata: {
        labels: {
          admin: 'mailhog',
        },
        name: 'mailhog',
        namespace: 'rnd',
      },
      spec: {
        clusterIP: 'None',
        ports: [
          {
            name: 'smtp',
            port: 1025,
          },
          {
            name: 'http',
            port: 8025,
          },
        ],
        selector: {
          admin: 'mailhog-pod',
        },
      },
    },
    { provider }
  )

export const ingress = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.networking.v1.Ingress(
    'mailhog-ingress',
    deepmerge(
      createIngress(
        config,
        [
          {
            path: '/',
            pathType: 'Prefix',
            backend: {
              service: {
                name: 'mailhog',
                port: {
                  number: 8025,
                },
              },
            },
          },
        ],
        'mailhog'
      ),
      {
        metadata: {
          name: 'ingress-mailhog',
          namespace: 'rnd',
          labels: {
            www: 'ingress',
          },
        },
      }
    ),
    { provider }
  )
