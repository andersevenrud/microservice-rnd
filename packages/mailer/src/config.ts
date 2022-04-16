const brokers = (process.env.KAFKA_BROKERS || '').split(',')
const mailerHost = process.env.MAILER_HOST || 'mailhog'
const mailerPort = parseInt(process.env.MAILER_PORT || '1025')

export default {
  appUrl: process.env.APP_URL || 'http://localhost:8080/',
  from: 'no-reply@mailer.app',
  waitOn: {
    resources: [
      ...brokers.map((s) => `tcp:${s}`),
      // NOTE: This is purely for development purposes.
      `tcp:${mailerHost}:${mailerPort}`,
    ],
  },
  kafka: {
    clientId: 'mailer',
    brokers,
  },
  mailer: {
    host: mailerHost,
    port: mailerPort,
    secure: false,
  },
}
