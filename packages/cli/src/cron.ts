import { spawn } from 'child_process'
import { schedule } from 'node-cron'

schedule('0 * * * *', () => {
  spawn('npm', ['run', 'cleanup'], {
    stdio: 'inherit',
    cwd: '/usr/src/cli',
  })
})

console.info('Cronjob is running...')
