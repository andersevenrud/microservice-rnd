import { MikroORM } from '@mikro-orm/core'
import { Options } from '@mikro-orm/core'
import { MariaDbDriver } from '@mikro-orm/mariadb'
import { ClientInstance } from './entities'

export default function createMikroOrm(
  config: Partial<Options<MariaDbDriver>>
) {
  const cfg: Options<MariaDbDriver> = {
    entities: [ClientInstance],
    type: 'mariadb',
    ...config,
  }

  return MikroORM.init<MariaDbDriver>(cfg)
}
