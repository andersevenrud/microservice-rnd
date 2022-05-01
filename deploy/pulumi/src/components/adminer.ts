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
                    value: config.get('env.DB_HOSTNAME') || 'db',
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

export const ingress = (config: Config, provider: k8s.Provider) =>
  new k8s.networking.v1.Ingress(
    'adminer-ingress',
    {
      metadata: {
        name: 'ingress-adminer',
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
            hosts: ['adminer.rnd.lvh.me'],
            secretName: 'selfsigned-root-secret',
          },
        ],
        rules: [
          {
            host: 'adminer.rnd.lvh.me',
            http: {
              paths: [
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
            },
          },
        ],
      },
    },

    { provider }
  )
