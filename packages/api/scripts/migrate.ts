import waitOn from 'wait-on'
import { MikroORM } from '@mikro-orm/core'
import { MariaDbDriver } from '@mikro-orm/mariadb'
import mikroConfig from '../mikro-orm.config'

const createMikro = () => MikroORM.init<MariaDbDriver>(mikroConfig)

async function main() {
  try {
    await waitOn({
      resources: ['tcp:db:3306'],
    })

    const orm = await createMikro()
    const migrator = orm.getMigrator()
    await migrator.up()
    await orm.close(true)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
