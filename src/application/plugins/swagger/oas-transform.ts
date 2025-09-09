import type { FastifyDynamicSwaggerOptions } from '@fastify/swagger'
import { ZodOpenApiParameters, api } from 'zod-openapi'
import { ComponentsObject } from 'zod-openapi/lib-types/api'
import { z } from 'zod'

type FreeformRecord = Record<string, any>

const components: ComponentsObject = {
  schemas: new Map(),
  parameters: new Map(),
  headers: new Map(),
  requestBodies: new Map(),
  responses: new Map(),
  openapi: '3.0.3',
}

const createParameter = (
  paramsSchema: z.ZodObject<any, any, any, any, any>,
  type: keyof ZodOpenApiParameters,
  path: string[]
) => {
  return Object.entries(paramsSchema.shape as z.ZodRawShape).reduce(
    (acc, [key, value]: [string, z.ZodType]) => {
      const parameter = api.createParamOrRef(value, components, [...path, key], type, key)

      if ('$ref' in parameter || !parameter.schema) {
        throw new Error('References not supported')
      }

      acc[`${key}`] = {
        ...parameter.schema,
        ...(parameter.required && { required: true }),
      }

      return acc
    },
    {}
  )
}

/**
 * Transforms zod schemas to a json-schema compatible with the Open API Spec (OAS) format
 */
export const transformSchemaToOas: FastifyDynamicSwaggerOptions['transform'] = ({
  schema,
  url,
}) => {
  if (!schema || schema.hide) {
    return { schema, url }
  }

  const transformed: FreeformRecord = {
    ...schema,
  }

  if (schema.querystring instanceof z.ZodObject) {
    transformed.querystring = createParameter(schema.querystring, 'query', [url, 'querystring'])
  }

  if (schema.params instanceof z.ZodObject) {
    transformed.params = createParameter(schema.params, 'path', [url, 'params'])
  }

  if (schema.headers instanceof z.ZodObject) {
    transformed.headers = createParameter(schema.headers, 'header', [url, 'headers'])
  }

  if (schema.body instanceof z.ZodType) {
    transformed.body = api.createMediaTypeSchema(schema.body, components, 'input', [url, 'body'])
  }

  for (const [statusCode, responseSchema] of Object.entries(schema.response || {}))
    if (schema.response) {
      if (responseSchema instanceof z.ZodType) {
        transformed.response[`${statusCode}`] = api.createMediaTypeSchema(
          responseSchema,
          components,
          'output',
          [url, 'response', statusCode]
        )
      }
    }

  return { schema: transformed, url }
}
