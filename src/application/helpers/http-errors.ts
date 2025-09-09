import { z } from 'zod'

const createErrorSchema = (statusCode: number) => {
  return z.object({
    statusCode: z.literal(statusCode),
    error: z.string(),
    message: z.string(),
  })
}

export const HttpErrorSchema = {
  NotFound: createErrorSchema(404).describe('Not Found HTTP Error'),
  Unauthorized: createErrorSchema(401).describe('Unauthorized'),
  BadRequest: z
    .intersection(
      createErrorSchema(400),
      z.object({
        errors: z
          .record(z.string(), z.string())
          .describe('Mapping between inputs and their corresponding error messages'),
      })
    )
    .describe('Bad Request HTTP Error'),
}

export type HttpErrorSchema = z.infer<ReturnType<typeof createErrorSchema>>
export type UnauthorizedError = z.infer<typeof HttpErrorSchema.Unauthorized>
export type BadRequestError = z.infer<typeof HttpErrorSchema.BadRequest>
