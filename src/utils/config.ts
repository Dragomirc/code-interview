import { z } from 'zod'
import { Level } from 'pino'

const requiredEnvError = (envName: string) => {
  return `process.env.${envName} variable is required`
}

export enum Stage {
  stag = 'stag',
  prod = 'prod',
}

const ConfigSchema = z.object({
  serviceName: z.string({ required_error: requiredEnvError('SERVICE_NAME') }),
  logLevel: z.custom<Level>(),
  port: z.number().optional(),
  stage: z.enum([Stage.stag, Stage.prod], {
    required_error: requiredEnvError('STAGE'),
  }),
  nodeEnv: z.enum(['production', 'development', 'test'], {
    required_error: requiredEnvError('NODE_ENV'),
  }),
  db: z.object({
    harvesterStore: z.object({
      url: z.string(),
      name: z.string(),
      maxPoolSize: z.number(),
    }),
  }),
})

const stage = process.env.STAGE as keyof typeof Stage

const parsedConfig = ConfigSchema.safeParse({
  serviceName: process.env.SERVICE_NAME,
  logLevel: process.env.LOG_LEVEL,
  port: 9000,
  nodeEnv: process.env.NODE_ENV,
  stage,
  db: {
    harvesterStore: {
      url: `harvesterstore-${process.env.STAGE}.xgs2n.mongodb.net`,
      name: `harvesterstore-${process.env.STAGE}`,
      maxPoolSize: 10,
    },
  },
})

if (!parsedConfig.success) {
  throw new Error(`Environment variable vaidation failed ${parsedConfig.error.message}`)
}

type Config = z.infer<typeof ConfigSchema>

const config = (parsedConfig.success ? parsedConfig.data : undefined) as Config

export default config

const getEnvConfig =
  (env: Stage) =>
  <T>(stagValue: T, prodValue: T) => {
    if (env === 'prod') return prodValue
    else return stagValue
  }

export const envConfig = getEnvConfig(config.stage)
