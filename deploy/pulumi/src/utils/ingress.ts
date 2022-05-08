import { Configuration } from '../config'

export const createIngress = (
  config: Configuration,
  paths: any[],
  subdomain?: string
) => {
  const annotations = {}
  const host = subdomain ? `${subdomain}.${config.host}` : config.host
  const cert = subdomain || 'root'
  const issuer = `${cert}-prod-cluster-issuer`
  const secretName = config.dev
    ? 'selfsigned-root-secret'
    : `${cert}-letsencrypt-prod`

  if (config.dev) {
    Object.assign(annotations, {
      'cert-manager.io/cluster-issuer': 'selfsigned-cluster-issuer',
    })
  } else {
    Object.assign(annotations, {
      'cert-manager.io/cluster-issuer': issuer,
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
