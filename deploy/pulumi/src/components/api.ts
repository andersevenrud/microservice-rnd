import { Config } from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import { dbEnv, kafkaEnv } from '../utils/env'
import { githubImage } from '../utils/image'

export const deployment = (config: Config, provider: k8s.Provider) =>
  new k8s.apps.v1.Deployment(
    'api-deployment',
    {
      metadata: {
        labels: {
          app: 'api',
        },
        name: 'api',
        namespace: 'rnd',
      },
      spec: {
        replicas: 2,
        selector: {
          matchLabels: {
            app: 'api-pod',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'api-pod',
            },
          },
          spec: {
            restartPolicy: 'Always',
            containers: [
              {
                name: 'api',
                image: githubImage(config, 'api'),
                imagePullPolicy: 'Always',
                ports: [
                  {
                    name: 'public',
                    containerPort: 8080,
                  },
                  {
                    name: 'health',
                    containerPort: 8081,
                  },
                ],
                env: [
                  ...dbEnv(config),
                  ...kafkaEnv(config),
                  {
                    name: 'HEALTH_READINESS_PROBE_DELAY',
                    value: '30000',
                  },
                ],
                readinessProbe: {
                  httpGet: {
                    path: '/readyz',
                    port: 8081,
                    scheme: 'HTTP',
                  },
                  initialDelaySeconds: 5,
                  periodSeconds: 10,
                },
                livenessProbe: {
                  httpGet: {
                    path: '/livez',
                    port: 8081,
                    scheme: 'HTTP',
                  },
                  initialDelaySeconds: 15,
                  periodSeconds: 20,
                },
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
    'api-service',
    {
      metadata: {
        labels: {
          app: 'api-service',
        },
        name: 'api',
        namespace: 'rnd',
      },
      spec: {
        type: 'LoadBalancer',
        ports: [
          {
            port: 8080,
          },
        ],
        selector: {
          app: 'api-pod',
        },
      },
    },
    { provider }
  )

export const health = (config: Config, provider: k8s.Provider) =>
  new k8s.core.v1.Service(
    'api-health',
    {
      metadata: {
        labels: {
          app: 'api-health',
        },
        name: 'api-health',
        namespace: 'rnd',
      },
      spec: {
        sessionAffinity: 'None',
        ports: [
          {
            port: 8081,
          },
        ],
        selector: {
          app: 'api-pod',
        },
      },
    },
    { provider }
  )
