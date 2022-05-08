import * as k8s from '@pulumi/kubernetes'
import { Configuration } from '../config'

export function cert(config: Configuration, provider?: k8s.Provider) {
  if (config.dev) {
    new k8s.yaml.ConfigFile(
      'selfsigned-cert',
      {
        file: 'src/dev/cert.yaml',
      },
      { provider }
    )
  } else {
    const certs = ['root', 'auth']

    for (const cert of certs) {
      new k8s.yaml.ConfigFile(
        `${cert}-prod-cert`,
        {
          file: 'src/prod/cert.yaml',
          transformations: [
            (o: any) => {
              o.metadata.name = `${cert}-prod-cluster-issuer`
              o.spec.acme.privateKeySecretRef.name = `${cert}-letsencrypt-prod`
            },
          ],
        },
        { provider }
      )
    }
  }
}
