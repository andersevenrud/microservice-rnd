import * as deepmerge from 'deepmerge'
import * as k8s from '@pulumi/kubernetes'
import { Configuration } from '../config'
import { createIngress } from '../utils/ingress'

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
            securityContext: {
              runAsNonRoot: true,
              fsGroup: 1000,
              runAsUser: 1000,
            },
            containers: [
              {
                name: 'keycloak',
                image: 'quay.io/keycloak/keycloak:18.0.0',
                args: ['start-dev'],
                imagePullPolicy: 'IfNotPresent',
                ports: [
                  {
                    containerPort: 8080,
                  },
                ],
                env: [
                  {
                    name: 'KEYCLOAK_ADMIN',
                    value: config.keycloak.username,
                  },
                  {
                    name: 'KEYCLOAK_ADMIN_PASSWORD',
                    value: config.keycloak.password,
                  },
                  {
                    name: 'KC_DB',
                    value: config.keycloak.db_type,
                  },
                  {
                    name: 'KC_DB_URL',
                    value: config.keycloak.db_url,
                  },
                  {
                    name: 'KC_DB_USERNAME',
                    value: config.keycloak_db.username,
                  },
                  {
                    name: 'KC_DB_PASSWORD',
                    value: config.keycloak_db.password,
                  },
                  {
                    name: 'KC_HOSTNAME',
                    value: config.keycloak.hostname,
                  },
                  {
                    name: 'KC_PROXY',
                    value: config.keycloak.proxy,
                  },
                  {
                    name: 'KC_HTTP_ENABLED',
                    value: 'true',
                  },
                  {
                    // Use configured hostname
                    name: 'KC_HOSTNAME_STRICT_BACKCHANNEL',
                    value: 'true',
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

export const ingress = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.networking.v1.Ingress(
    'keycloak-ingress',
    deepmerge(
      createIngress(
        config,
        [
          {
            path: '/',
            pathType: 'Prefix',
            backend: {
              service: {
                name: 'keycloak',
                port: {
                  number: 8080,
                },
              },
            },
          },
        ],
        'auth'
      ),
      {
        metadata: {
          name: 'ingress-keycloak',
          namespace: 'rnd',
          labels: {
            www: 'ingress',
          },
        },
      }
    ),

    { provider }
  )

export const dbStatefulSet = (config: Configuration, provider?: k8s.Provider) =>
  new k8s.apps.v1.StatefulSet(
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
        serviceName: 'keycloak-db',
        updateStrategy: {
          type: 'RollingUpdate',
        },
        selector: {
          matchLabels: {
            backend: 'keycloak-db-pod',
          },
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
        volumeClaimTemplates: [
          {
            metadata: {
              name: 'keycloak-db-data',
            },
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: config.keycloak_db_storage_size,
                },
              },
            },
          },
        ],
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
