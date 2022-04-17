import { Options } from '@mikro-orm/core'
import { MariaDbDriver } from '@mikro-orm/mariadb'
import { ClientInstance } from './src/entities'
import cfg from './src/config'

const config: Options<MariaDbDriver> = {
  entities: [ClientInstance],
  type: 'mariadb',
  ...cfg.db,
}

export default config
