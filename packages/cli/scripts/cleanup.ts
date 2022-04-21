import waitOn from 'wait-on'
import { MikroORM } from '@mikro-orm/core'
import { MariaDbDriver } from '@mikro-orm/mariadb'
import mikroConfig from '../mikro-orm.config'
import config from '../src/config'
import { ClientInstance } from '../src/entities'

const createMikro = () => MikroORM.init<MariaDbDriver>(mikroConfig)

async function main() {
  try {
    await waitOn({
      resources: [`tcp:${config.db.host}:3306`],
      log: true,
    })

    const orm = await createMikro()

    const em = orm.em.fork()
    const result = await em
      .qb(ClientInstance)
      .delete()
      .where({
        deletedAt: { $ne: null },
      })

    console.info('Cleanup done', result.affectedRows)
    await orm.close(true)
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
