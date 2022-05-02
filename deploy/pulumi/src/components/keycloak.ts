import * as k8s from '@pulumi/kubernetes'
import { Configuration } from '../config'

export const statefulSet = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.apps.v1.StatefulSet(
    'keycloak-deployment',
    {
      metadata: {
        labels: {
          backend: 'keycloak',
        },
        name: 'keycloak',
        namespace: 'rnd',
      },
      spec: {
        serviceName: 'keycloak',
        replicas: 1,
        selector: {
          matchLabels: {
            backend: 'keycloak-pod',
          },
        },
        updateStrategy: {
          type: 'RollingUpdate',
        },
        podManagementPolicy: 'Parallel',
        template: {
          metadata: {
            labels: {
              backend: 'keycloak-pod',
            },
          },
          spec: {
            restartPolicy: 'Always',
            containers: [
              {
                name: 'keycloak',
                image: 'quay.io/keycloak/keycloak:18.0.0',
                imagePullPolicy: 'IfNotPresent',
                ports: [
                  {
                    containerPort: 8080,
                  },
                ],
                env: [
                  {
                    name: 'env.KEYCLOAK_ADMIN',
                    value: config.keycloak.username,
                  },
                  {
                    name: 'env.KEYCLOAK_ADMIN_PASSWORD',
                    value: config.keycloak.password,
                  },
                  {
                    name: 'env.KC_DB',
                    value: config.keycloak.db_type,
                  },
                  {
                    name: 'env.KC_DB_URL',
                    value: config.keycloak.db_url,
                  },
                  {
                    name: 'env.KC_DB_USERNAME',
                    value: config.keycloak_db.username,
                  },
                  {
                    name: 'env.KC_DB_PASSWORD',
                    value: config.keycloak_db.password,
                  },
                  {
                    name: 'env.KC_HOSTNAME',
                    value: config.keycloak.hostname,
                  },
                ],
                volumeMounts: [
                  {
                    mountPath: '/opt/keycloak/data',
                    name: 'keycloak-data',
                  },
                ],
              },
            ],
          },
        },
        volumeClaimTemplates: [
          {
            metadata: {
              name: 'keycloak-data',
            },
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: config.keycloak_storage_size,
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
    'keycloak-service',
    {
      metadata: {
        labels: {
          backend: 'keycloak',
        },
        name: 'keycloak',
        namespace: 'rnd',
      },
      spec: {
        clusterIP: 'None',
        ports: [
          {
            name: 'http',
            port: 8080,
          },
        ],
        selector: {
          backend: 'keycloak-pod',
        },
      },
    },
    { provider }
  )

export const dbDeployment = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.apps.v1.Deployment(
    'keycloak-db-deployment',
    {
      metadata: {
        labels: {
          backend: 'keycloak-db',
        },
        name: 'keycloak-db',
        namespace: 'rnd',
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            backend: 'keycloak-db-pod',
          },
        },
        strategy: {
          type: 'Recreate',
        },
        template: {
          metadata: {
            labels: {
              backend: 'keycloak-db-pod',
            },
          },
          spec: {
            restartPolicy: 'Always',
            containers: [
              {
                name: 'keycloak-db',
                image: 'postgres:14.2',
                imagePullPolicy: 'IfNotPresent',
                ports: [
                  {
                    containerPort: 5432,
                  },
                ],
                env: [
                  {
                    name: 'POSTGRES_DB',
                    value: config.keycloak_db.name,
                  },
                  {
                    name: 'POSTGRES_PASSWORD',
                    value: config.keycloak_db.password,
                  },
                  {
                    name: 'POSTGRES_USER',
                    value: config.keycloak_db.username,
                  },
                ],
                volumeMounts: [
                  {
                    mountPath: '/var/lib/postgresql/data',
                    name: 'keycloak-db-data',
                  },
                ],
              },
            ],
            volumes: [
              {
                name: 'keycloak-db-data',
                persistentVolumeClaim: {
                  claimName: 'keycloak-db-data',
                },
              },
            ],
          },
        },
      },
    },
    { provider }
  )

export const dbService = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.core.v1.Service(
    'keycloak-db-service',
    {
      metadata: {
        labels: {
          backend: 'keycloak-db',
        },
        name: 'keycloak-db',
        namespace: 'rnd',
      },
      spec: {
        ports: [
          {
            port: 5432,
            targetPort: 5432,
          },
        ],
        selector: {
          backend: 'keycloak-db-pod',
        },
      },
    },
    { provider }
  )

export const dbPvc = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.core.v1.PersistentVolumeClaim(
    'keycloak-db-pvc',
    {
      metadata: {
        labels: {
          backend: 'keycloak-db',
        },
        name: 'keycloak-db-data',
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
