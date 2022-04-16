import { Options } from '@mikro-orm/core'
import { MariaDbDriver } from '@mikro-orm/mariadb'
import { ClientInstance } from './src/entities'
import config from './src/config'

const cfg: Options<MariaDbDriver> = {
  entities: [ClientInstance],
  type: 'mariadb',
  ...config.db,
}

export default cfg
