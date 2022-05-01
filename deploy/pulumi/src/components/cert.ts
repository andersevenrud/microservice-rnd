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
    new k8s.yaml.ConfigFile(
      'prod-cert',
      {
        file: 'src/prod/cert.yaml',
      },
      { provider }
    )
  }
}
