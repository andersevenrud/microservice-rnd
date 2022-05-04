const dbHost = process.env.DB_HOST || 'db'
const brokers = (process.env.KAFKA_BROKERS || '').split(',')

export default {
  appUrl: (process.env.APP_URL || 'https://rnd.lvh.me').replace(/\/?$/, ''),

  kafka: {
    clientId: 'cli',
    brokers,
  },

  db: {
    dbName: process.env.DB_NAME || 'db',
    host: dbHost,
    user: process.env.DB_USER || 'db',
    password: process.env.DB_PASSWORD || 'db',
  },

  keycloak: {
    baseUrl: process.env.KEYCLOAK_URL || 'https://auth.rnd.lvh.me',
    realmName: process.env.KEYCLOAK_REALM || 'rnd',
    options: {
      username: process.env.KEYCLOAK_USERNAME || 'admin',
      password: process.env.KEYCLOAK_PASSWORD || 'admin',
      grantType: 'password',
      clientId: 'admin-cli',
    },
  },
}
