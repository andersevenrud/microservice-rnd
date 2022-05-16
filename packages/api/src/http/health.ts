import express from 'express'

export async function createHealthCheck() {
  let ready = false

  const app = express()

  app.get('/readyz', (_, res) => {
    res.status(ready ? 200 : 500).end()
  })

  app.get('/livez', (_, res) => {
    res.status(ready ? 200 : 500).end()
  })

  const server = app.listen(8081)

  return {
    async ready() {
      ready = true
    },
    async destroy() {
      ready = false
      server.close()
    },
  }
}
