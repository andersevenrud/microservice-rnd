import pm2, { ProcessDescription } from 'pm2'

const wrapCatch = (e: Error | Error[]) => (Array.isArray(e) ? e[0] : e)

export class PM2Manager {
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => (err ? reject(err) : resolve()))
    })
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        pm2.disconnect()
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  async kill(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        pm2.killDaemon(() => resolve())
      } catch (e) {
        reject(e)
      }
    })
  }

  async list(): Promise<ProcessDescription[]> {
    return new Promise((resolve, reject) => {
      pm2.list((err, list) => (err ? reject(wrapCatch(err)) : resolve(list)))
    })
  }

  async start(uuid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (process.env.NODE_ENV === 'production') {
        pm2.start(
          {
            script: 'dist/src/instance.js',
            name: `client:${uuid}`,
            args: `--uuid ${uuid}`,
            interpreter: 'node',
          },
          (err) => (err ? reject(wrapCatch(err)) : resolve())
        )
      } else {
        pm2.start(
          {
            script: 'src/instance.ts',
            name: `client:${uuid}`,
            args: `--uuid ${uuid}`,
            interpreter: 'node',
            interpreter_args: '--require ts-node/register',
            watch: ['src/*.ts'],
          },
          (err) => (err ? reject(wrapCatch(err)) : resolve())
        )
      }
    })
  }

  async stop(uuid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.stop(`client:${uuid}`, (err) =>
        err ? reject(wrapCatch(err)) : resolve()
      )
    })
  }

  async delete(uuid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.delete(`client:${uuid}`, (err) =>
        err ? reject(wrapCatch(err)) : resolve()
      )
    })
  }

  async restart(uuid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.restart(`client:${uuid}`, (err) =>
        err ? reject(wrapCatch(err)) : resolve()
      )
    })
  }

  async isRunning(uuid: string) {
    const list = await this.list()

    return (
      list.findIndex(
        (item) =>
          item.name === `client:${uuid}` && item.pm2_env?.status === 'online'
      ) >= 0
    )
  }
}
