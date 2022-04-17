import waitOn from 'wait-on'
import { MikroORM } from '@mikro-orm/core'
import { MariaDbDriver } from '@mikro-orm/mariadb'
import mikroConfig from '../mikro-orm.config'
import config from '../src/config'

const createMikro = () => MikroORM.init<MariaDbDriver>(mikroConfig)

async function main() {
  try {
    await waitOn({
      resources: [`tcp:${config.db.host}:3306`],
      log: true,
    })

    const orm = await createMikro()
    const migrator = orm.getMigrator()
    await migrator.up()

    console.info('Migrations done')
    await orm.close(true)
    console.info('Exiting script...')
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
