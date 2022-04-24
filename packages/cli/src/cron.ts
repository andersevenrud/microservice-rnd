import { spawn } from 'child_process'
import { schedule } from 'node-cron'

/*
 * This is only used in the docker-compose development environment.
 * On a kubernetes cluster this is not used. Instead a cron job is applied
 * to the kubernetes pod.
 */

schedule('0 * * * *', () => {
  spawn('npm', ['run', 'cleanup'], {
    stdio: 'inherit',
    cwd: '/usr/src/cli',
  })
})

console.info('Cronjob is running...')
