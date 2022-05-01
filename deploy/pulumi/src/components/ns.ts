import * as k8s from '@pulumi/kubernetes'
import { Configuration } from '../config'

export const rnd = (config: Configuration, provider: k8s.Provider) =>
  new k8s.core.v1.Namespace(
    'namespace',
    {
      metadata: {
        labels: {
          ns: 'rnd',
        },
        name: 'rnd',
      },
    },
    { provider }
  )
