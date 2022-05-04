const dbHost = process.env.DB_HOST || 'db'
const brokers = (process.env.KAFKA_BROKERS || '').split(',')

export default {
  auth: {
    issuerBaseURL:
      process.env.OAUTH_ISSUER_URL || 'https://auth.rnd.lvh.me/realms/rnd',
    audience: process.env.OAUTH_AUDIENCE || 'account',
  },

  waitOn: {
    resources: [...brokers.map((s) => `tcp:${s}`), `tcp:${dbHost}:3306`],
    log: true,
    timeout: 60 * 1000,
  },

  shutdown: {
    delay: parseInt(process.env.HEALTH_READINESS_PROBE_DELAY || '0'),
  },

  kafka: {
    clientId: 'api',
    brokers,
  },

  db: {
    dbName: process.env.DB_NAME || 'db',
    host: dbHost,
    user: process.env.DB_USER || 'db',
    password: process.env.DB_PASSWORD || 'db',
  },
}
