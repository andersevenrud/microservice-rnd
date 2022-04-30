import { Config } from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'

export const statefulSet = (config: Config, provider: k8s.Provider) =>
  new k8s.apps.v1.StatefulSet(
    'zookeeper-deployment',
    {
      metadata: {
        labels: {
          backend: 'zookeeper',
        },
        name: 'zookeeper',
        namespace: 'rnd',
      },
      spec: {
        serviceName: 'zookeeper',
        replicas: 1,
        selector: {
          matchLabels: {
            backend: 'zookeeper-pod',
          },
        },
        updateStrategy: {
          type: 'RollingUpdate',
        },
        podManagementPolicy: 'Parallel',
        template: {
          metadata: {
            labels: {
              backend: 'zookeeper-pod',
            },
          },
          spec: {
            restartPolicy: 'Always',
            securityContext: {
              fsGroup: 1001,
              runAsUser: 1001,
            },
            containers: [
              {
                name: 'zookeeper',
                image: 'bitnami/zookeeper:3.8.0',
                imagePullPolicy: 'IfNotPresent',
                ports: [
                  {
                    containerPort: 2181,
                    name: 'client',
                  },
                  {
                    containerPort: 2888,
                    name: 'peer',
                  },
                  {
                    containerPort: 3888,
                    name: 'leader-election',
                  },
                ],
                env: [
                  {
                    name: 'ALLOW_ANONYMOUS_LOGIN',
                    value: 'yes',
                  },
                ],
                volumeMounts: [
                  {
                    mountPath: '/bitnami/zookeeper',
                    name: 'zookeeper-data',
                  },
                ],
              },
            ],
          },
        },
        volumeClaimTemplates: [
          {
            metadata: {
              name: 'zookeeper-data',
            },
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: config.get('ZOOKEEPER_DATA_STORAGE') || '1Gi',
                },
              },
            },
          },
        ],
      },
    },
    { provider }
  )

export const service = (config: Config, provider: k8s.Provider) =>
  new k8s.core.v1.Service(
    'zookeeper-service',
    {
      metadata: {
        labels: {
          backend: 'zookeeper',
        },
        name: 'zookeeper',
        namespace: 'rnd',
      },
      spec: {
        clusterIP: 'None',
        ports: [
          {
            port: 2181,
            name: 'client',
          },
        ],
        selector: {
          backend: 'zookeeper-pod',
        },
      },
    },
    { provider }
  )
