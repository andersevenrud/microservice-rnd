import * as k8s from '@pulumi/kubernetes'
import { Configuration } from '../config'

export const statefulSet = (config: Configuration, provider: k8s.Provider) =>
  new k8s.apps.v1.StatefulSet(
    'kafka-deployment',
    {
      metadata: {
        labels: {
          backend: 'kafka',
        },
        name: 'kafka',
        namespace: 'rnd',
      },
      spec: {
        serviceName: 'kafka',
        replicas: 1,
        selector: {
          matchLabels: {
            backend: 'kafka-pod',
          },
        },
        updateStrategy: {
          type: 'RollingUpdate',
        },
        podManagementPolicy: 'Parallel',
        template: {
          metadata: {
            labels: {
              backend: 'kafka-pod',
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
                name: 'kafka',
                image: 'bitnami/kafka:3.0.1',
                imagePullPolicy: 'IfNotPresent',
                ports: [
                  {
                    name: 'internal',
                    containerPort: 9092,
                  },
                  {
                    name: 'external',
                    containerPort: 9093,
                  },
                  {
                    name: 'jmx',
                    containerPort: 5555,
                  },
                ],
                env: [
                  {
                    name: 'ALLOW_PLAINTEXT_LISTENER',
                    value: 'yes',
                  },
                  {
                    name: 'KAFKA_BROKER_ID',
                    value: '1',
                  },
                  {
                    name: 'KAFKA_CFG_ADVERTISED_LISTENERS',
                    value: 'CLIENT://:9092,EXTERNAL://:9093',
                  },
                  {
                    name: 'KAFKA_CFG_INTER_BROKER_LISTENER_NAME',
                    value: 'CLIENT',
                  },
                  {
                    name: 'KAFKA_CFG_LISTENERS',
                    value: 'CLIENT://:9092,EXTERNAL://:9093',
                  },
                  {
                    name: 'KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP',
                    value: 'CLIENT:PLAINTEXT,EXTERNAL:PLAINTEXT',
                  },
                  {
                    name: 'KAFKA_CFG_ZOOKEEPER_CONNECT',
                    value: 'zookeeper:2181',
                  },
                ],
                volumeMounts: [
                  {
                    mountPath: '/bitnami/kafka',
                    name: 'kafka-data',
                  },
                ],
              },
            ],
          },
        },
        volumeClaimTemplates: [
          {
            metadata: {
              name: 'kafka-data',
            },
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: config.kafka_storage_size,
                },
              },
            },
          },
        ],
      },
    },
    { provider }
  )

export const service = (config: Configuration, provider: k8s.Provider) =>
  new k8s.core.v1.Service(
    'kafka-service',
    {
      metadata: {
        labels: {
          backend: 'kafka',
        },
        name: 'kafka',
        namespace: 'rnd',
      },
      spec: {
        clusterIP: 'None',
        ports: [
          {
            name: 'internal',
            port: 9092,
          },
          {
            name: 'external',
            port: 9093,
          },
        ],
        selector: {
          backend: 'kafka-pod',
        },
      },
    },
    { provider }
  )
