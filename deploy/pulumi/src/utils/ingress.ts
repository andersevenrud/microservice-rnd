import { Config } from '@pulumi/pulumi'

export const createIngress = (config: Config, paths: any[]) => {
  const isDev = config.get('mode') === 'dev'
  const annotations = {}
  const secretName = isDev ? 'selfsigned-root-secret' : 'letsencrypt-prod'
  const host = config.get('host') || 'rnd.lvh.me'

  if (isDev) {
    Object.assign(annotations, {
      'cert-manager.io/cluster-issuer': 'selfsigned-cluster-issuer',
    })
  } else {
    Object.assign(annotations, {
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
