import { Config } from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import { githubImage } from '../utils/image'

export const deployment = (config: Config, provider: k8s.Provider) =>
  new k8s.apps.v1.Deployment(
    'app-deployment',
    {
      metadata: {
        labels: {
          app: 'app',
        },
        name: 'app',
        namespace: 'rnd',
      },
      spec: {
        selector: {
          matchLabels: {
            app: 'app-pod',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'app-pod',
            },
          },
          spec: {
            restartPolicy: 'Always',
            containers: [
              {
                name: 'app',
                image: githubImage(config, 'app'),
                imagePullPolicy: 'Always',
              },
            ],
          },
        },
      },
    },
    { provider }
  )

export const scale = (config: Config, provider: k8s.Provider) =>
  new k8s.autoscaling.v1.HorizontalPodAutoscaler(
    'app-scale',
    {
      metadata: {
        labels: {
          app: 'app',
        },
        name: 'app',
        namespace: 'rnd',
      },
      spec: {
        scaleTargetRef: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          name: 'app',
        },
        minReplicas: 1,
        maxReplicas: 3,
        targetCPUUtilizationPercentage: 85,
      },
    },
    { provider }
  )

export const service = (config: Config, provider: k8s.Provider) =>
  new k8s.core.v1.Service(
    'app-service',
    {
      metadata: {
        labels: {
          app: 'app',
        },
        name: 'app',
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
          app: 'app-pod',
        },
      },
    },
    { provider }
  )

export const ingress = (config: Config, provider: k8s.Provider) =>
  new k8s.networking.v1.Ingress(
    'app-ingress',
    {
      metadata: {
        name: 'ingress-root',
        namespace: 'rnd',
        labels: {
          www: 'ingress',
        },
        annotations: {
          'cert-manager.io/cluster-issuer': 'selfsigned-cluster-issuer',
        },
      },
      spec: {
        tls: [
          {
            hosts: ['rnd.lvh.me'],
            secretName: 'selfsigned-root-secret',
          },
        ],
        rules: [
          {
            host: 'rnd.lvh.me',
            http: {
              paths: [
                {
                  path: '/',
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: 'app',
                      port: {
                        number: 8080,
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },

    { provider }
  )
