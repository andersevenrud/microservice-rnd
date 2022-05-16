type ShutdownFn = () => any

async function run(list: ShutdownFn[]) {
  for (const fn of list) {
    try {
      await fn()
    } catch (e) {
      console.error(e)
    }
  }
}

export function useShutdown(
  delay = 0,
  signals: string[] = ['SIGUSR2', 'SIGINT', 'SIGTERM']
) {
  let shuttingDown = false
  const callbacks: {
    before: boolean
    fn: ShutdownFn
  }[] = []

  const down = async (failure = false, signal?: string) => {
    const code = failure ? 1 : 0
    const befores = callbacks.filter(({ before }) => before).map(({ fn }) => fn)
    const afters = callbacks.filter(({ before }) => !before).map(({ fn }) => fn)

    if (shuttingDown) {
      return
    }
    shuttingDown = true

    try {
      await run(befores)

      // NOTE: This only applies to kubernetes as we want to the readiness probe to fail before actually stopping
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      await run(afters)
    } catch (e) {
      console.error('Exception on shutdown', e)
    } finally {
      console.log('Exiting process with code', code, signal)
      process.exit(code)
    }
  }

  const add = (fn: ShutdownFn | ShutdownFn[], before = false) => {
    const fns = Array.isArray(fn) ? fn : [fn]
    callbacks.push(...fns.map((fn) => ({ fn, before })))
  }

  signals.forEach((signal) => process.once(signal, () => down(false, signal)))

  return { down, add }
}
