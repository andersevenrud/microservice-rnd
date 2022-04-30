import { Config } from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'

export const deployment = (config: Config, provider: k8s.Provider) =>
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
                    value: config.get('DB_NAME') || 'db',
                  },
                  {
                    name: 'MARIADB_PASSWORD',
                    value: config.get('DB_PASSWORD') || 'db',
                  },
                  {
                    name: 'MARIADB_ROOT_PASSWORD',
                    value: config.get('DB_PASSWORD') || 'db',
                  },
                  {
                    name: 'MARIADB_USER',
                    value: config.get('DB_USERNAME') || 'db',
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

export const service = (config: Config, provider: k8s.Provider) =>
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

export const pvc = (config: Config, provider: k8s.Provider) =>
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
            storage: config.get('DB_DATA_STORAGE') || '1Gi',
          },
        },
      },
    },
    { provider }
  )
