const dbHost = process.env.DB_HOST || 'db'
const brokers = (process.env.KAFKA_BROKERS || '').split(',')

export default {
  waitOn: {
    resources: [...brokers.map((s) => `tcp:${s}`), `tcp:${dbHost}:3306`],
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
