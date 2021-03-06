import * as deepmerge from 'deepmerge'
import * as k8s from '@pulumi/kubernetes'
import { dbEnv, kafkaEnv } from '../utils/env'
import { githubImage } from '../utils/image'
import { createIngress } from '../utils/ingress'
import { Configuration } from '../config'

export const deployment = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.apps.v1.Deployment(
    'api-deployment',
    {
      metadata: {
        labels: {
          app: 'api',
          version: config.version,
          sha: config.sha,
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
                    name: 'OAUTH_ISSUER_URL',
                    value: config.oauth.issuerUrl,
                  },
                  {
                    name: 'OAUTH_AUDIENCE',
                    value: config.oauth.audience,
                  },
                  {
                    name: 'HEALTH_READINESS_PROBE_DELAY',
                    value: '30000',
                  },

                  // FIXME: This is just because I haven't yet figured out a way to
                  // make api calls to keycloak server behind an ingress with self-signed
                  // certificates work.
                  {
                    name: 'NODE_TLS_REJECT_UNAUTHORIZED',
                    value: config.dev ? '0' : '1',
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

export const service = (config: Configuration, provider?: k8s.Provider) =>
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

export const health = (config: Configuration, provider?: k8s.Provider) =>
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

export const ingress = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.networking.v1.Ingress(
    'api-ingress',
    deepmerge(
      createIngress(config, [
        {
          path: '/api(/|$)(.*)',
          pathType: 'Prefix',
          backend: {
            service: {
              name: 'api',
              port: {
                number: 8080,
              },
            },
          },
        },
      ]),
      {
        metadata: {
          name: 'ingress-api',
          namespace: 'rnd',
          labels: {
            www: 'ingress',
          },
          annotations: {
            'nginx.ingress.kubernetes.io/rewrite-target': '/$2',
          },
        },
      }
    ),
    { provider }
  )
