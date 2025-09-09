/* eslint-disable no-console */
import { execa as exec } from 'execa'

try {
  const [, , entrypoint] = process.argv

  const variables: Record<string, string> = {
    NODE_ENV: 'development',
    STAGE: 'stag',
    LOG_LEVEL: 'debug',
    SERVICE_NAME: 'core-api',
  }

  await exec('tsx', ['watch', `src/${entrypoint}`], {
    stdio: 'inherit',
    env: { ...process.env, ...variables },
  })
} catch (error) {
  process.exit((error as any).exitCode || 1)
}
