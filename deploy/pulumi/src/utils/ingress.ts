import { Configuration } from '../config'

export const createIngress = (config: Configuration, paths: any[], subdomain?: string) => {
  const annotations = {}
  const secretName = config.dev ? 'selfsigned-root-secret' : 'letsencrypt-prod'
  const host = subdomain ? `${subdomain}.${config.host}` : config.host

  if (config.dev) {
    Object.assign(annotations, {
      'cert-manager.io/cluster-issuer': 'selfsigned-cluster-issuer',
    })
  } else {
    Object.assign(annotations, {
      'cert-manager.io/cluster-issuer': 'prod-cluster-issuer',
      'kubernetes.io/ingress.class': 'nginx',
    })
  }

  return {
    metadata: {
      annotations,
    },
    spec: {
      tls: [
        {
          hosts: [host],
          secretName,
        },
      ],
      rules: [
        {
          host,
          http: {
            paths,
          },
        },
      ],
    },
  }
}
