import * as k8s from '@pulumi/kubernetes'
import { Configuration } from '../config'

export const deployment = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.apps.v1.Deployment(
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
        replicas: 1,
        selector: {
          matchLabels: {
            backend: 'db-pod',
          },
        },
        strategy: {
          type: 'Recreate',
        },
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
            volumes: [
              {
                name: 'db-data',
                persistentVolumeClaim: {
                  claimName: 'db-data',
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

export const pvc = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.core.v1.PersistentVolumeClaim(
    'db-pvc',
    {
      metadata: {
        labels: {
          backend: 'db',
        },
        name: 'db-data',
        namespace: 'rnd',
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
    { provider }
  )
