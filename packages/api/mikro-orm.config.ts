import { Options } from '@mikro-orm/core'
import { MariaDbDriver } from '@mikro-orm/mariadb'
import { ClientInstance } from './src/entities'

const config: Options<MariaDbDriver> = {
  entities: [ClientInstance],
  type: 'mariadb',
  dbName: 'db',
  host: 'db',
  user: 'db',
  password: 'db',
}

export default config
