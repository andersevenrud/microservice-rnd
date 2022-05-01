import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as ns from './components/ns'
import * as adminer from './components/adminer'
import * as api from './components/api'
import * as app from './components/app'
import * as db from './components/db'
import * as kafka from './components/kafka'
import * as kowl from './components/kowl'
import * as mailer from './components/mailer'
import * as mailhog from './components/mailhog'
import * as runner from './components/runner'
import * as zookeeper from './components/zookeeper'
import * as jobs from './components/jobs'

export default function createConfiguration(
  config: pulumi.Config,
  provider: k8s.Provider
) {
  const isDev = config.get('mode') === 'dev'
  ns.rnd(config, provider)

  if (isDev) {
    new k8s.yaml.ConfigFile(
      'selfsigned-cert',
      {
        file: 'src/dev/cert.yaml',
      },
      { provider }
    )
  }

  zookeeper.statefulSet(config, provider)
  zookeeper.service(config, provider)

  kafka.statefulSet(config, provider)
  kafka.service(config, provider)

  db.deployment(config, provider)
  db.service(config, provider)
  db.pvc(config, provider)

  api.deployment(config, provider)
  api.service(config, provider)
  api.health(config, provider)
  api.ingress(config, provider)

  app.deployment(config, provider)
  app.service(config, provider)
  app.scale(config, provider)
  app.ingress(config, provider)

  mailer.deployment(config, provider)

  runner.deployment(config, provider)

  jobs.cleanup(config, provider)
  jobs.migration(config, provider)

  mailhog.deployment(config, provider)
  mailhog.service(config, provider)

  if (isDev) {
    adminer.deployment(config, provider)
    adminer.service(config, provider)
    adminer.ingress(config, provider)

    kowl.deployment(config, provider)
    kowl.service(config, provider)
    kowl.ingress(config, provider)

    mailhog.ingress(config, provider)
  }
}
