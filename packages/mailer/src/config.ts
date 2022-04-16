const brokers = (process.env.KAFKA_BROKERS || '').split(',')

export default {
  appUrl: process.env.APP_URL || 'http://localhost:8080/',
  from: 'no-reply@mailer.app',
  waitOn: {
    resources: [...brokers.map((s) => `tcp:${s}`)],
  },
  kafka: {
    clientId: 'mailer',
    brokers,
  },
  mailer: {
    host: process.env.MAILER_HOST || 'mailhog',
    port: parseInt(process.env.MAILER_PORT || '1025'),
    secure: false,
  },
}
