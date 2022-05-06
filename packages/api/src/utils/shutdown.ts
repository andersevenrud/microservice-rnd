export function useShutdown(
  destroy: () => (() => any)[],
  delay = 0,
  signals: string[] = ['SIGUSR2', 'SIGINT', 'SIGTERM']
) {
  let shuttingDown = false

  const shutdown = async (failure = false, signal?: string) => {
    const code = failure ? 1 : 0

    if (shuttingDown) {
      return
    }
    shuttingDown = true

    // NOTE: This only applies to kubernetes as we want to the readiness probe to fail before actually stopping
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    try {
      for (const fn of destroy()) {
        try {
          await fn()
        } catch (e) {
          console.error(e)
        }
      }
    } catch (e) {
      console.error('Exception on shutdown', e)
    } finally {
      console.log('Exiting process with code', code, signal)
      process.exit(code)
    }
  }

  signals.forEach((signal) =>
    process.once(signal, () => shutdown(false, signal))
  )

  return shutdown
}
