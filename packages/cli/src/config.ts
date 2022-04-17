const dbHost = process.env.DB_HOST || 'db'
const brokers = (process.env.KAFKA_BROKERS || '').split(',')

export default {
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
}
