import * as k8s from '@pulumi/kubernetes'
import { Configuration } from '../config'

export const statefulSet = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.apps.v1.StatefulSet(
    'db-deployment',
    {
      metadata: {
        labels: {
          backend: 'db',
        },
        name: 'db',
        namespace: 'rnd',
      },
      spec: {
        serviceName: 'db',
        replicas: 1,
        selector: {
          matchLabels: {
            backend: 'db-pod',
          },
        },
        updateStrategy: {
          type: 'RollingUpdate',
        },
        podManagementPolicy: 'Parallel',
        template: {
          metadata: {
            labels: {
              backend: 'db-pod',
            },
          },
          spec: {
            restartPolicy: 'Always',
            containers: [
              {
                name: 'db',
                image: 'mariadb:10.8',
                imagePullPolicy: 'IfNotPresent',
                ports: [
                  {
                    containerPort: 3306,
                  },
                ],
                env: [
                  {
                    name: 'MARIADB_DATABASE',
                    value: config.db.name,
                  },
                  {
                    name: 'MARIADB_PASSWORD',
                    value: config.db.password,
                  },
                  {
                    name: 'MARIADB_ROOT_PASSWORD',
                    value: config.db.password,
                  },
                  {
                    name: 'MARIADB_USER',
                    value: config.db.username,
                  },
                ],
                volumeMounts: [
                  {
                    mountPath: '/var/lib/mysql',
                    name: 'db-data',
                  },
                ],
              },
            ],
          },
        },
        volumeClaimTemplates: [
          {
            metadata: {
              name: 'db-data',
            },
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: config.db_storage_size,
                },
              },
            },
          },
        ],
      },
    },
    { provider }
  )

export const service = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.core.v1.Service(
    'db-service',
    {
      metadata: {
        labels: {
          backend: 'db',
        },
        name: 'db',
        namespace: 'rnd',
      },
      spec: {
        ports: [
          {
            port: 3306,
            targetPort: 3306,
          },
        ],
        selector: {
          backend: 'db-pod',
        },
      },
    },
    { provider }
  )
