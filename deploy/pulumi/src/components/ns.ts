import { Config } from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'

export const rnd = (config: Config, provider: k8s.Provider) =>
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
