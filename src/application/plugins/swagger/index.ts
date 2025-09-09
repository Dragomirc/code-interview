import { FastifySchema } from 'fastify'
import fp from 'fastify-plugin'
import swagger, { SwaggerOptions } from '@fastify/swagger'
import { transformSchemaToOas } from './oas-transform'
import config from '../../../utils/config'

const schema: FastifySchema = {
  hide: true,
}

const routeConfig = {}

const swaggerOptions: SwaggerOptions = {
  openapi: {
    info: {
      title: 'API',
      description: 'API documentation',
      version: '0.0.0',
    },
    servers: [{ url: `http://localhost:${config.port}`, description: 'Local' }],
    components: {
      securitySchemes: {
        jwt: {
          type: 'http',
          scheme: 'bearer',
          description: 'AWS Cognito JWT bearer authentication',
        },
      },
    },
  },
  refResolver: {
    clone: true,
    buildLocalReference: (jsonSchema, baseUri, fragment, counter) =>
      typeof jsonSchema.$id === 'string' ? jsonSchema.$id : `def-${counter}`,
  },
  transform: transformSchemaToOas,
}

const swaggerPlugin = fp(async fastify => {
  await fastify.register(swagger, swaggerOptions)

  fastify.get('/docs/json', { schema, config: routeConfig }, async () => {
    return fastify.swagger()
  })

  fastify.get('/docs', { schema, config: routeConfig }, (req, reply) => {
    reply.type('text/html').send(`
      <!doctype html>
      <html lang="en">
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
          <link rel="icon" type="image/x-icon" href="https://www.inyourarea.co.uk/assets/favicon/android-icon-192x192.png">
          <title>Harvester Core API Documentation</title>
          <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
          <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
          <style>
            .sl-sticky { min-height: 100vh; }
            #g-button {
              background-color: #ebeef5;
              padding: 32px;
              border-radius: 12px;
              position: absolute;
              top: 40%;
              left: 50%;
              transform: translate(-50%, 0);
              min-width: 350px;
              min-height: 150px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
          </style>
      </head>

      <body>
        <script>
          function loadDocumentation(credential) {
            fetch('/docs/json', { headers: { Authorization: credential } })
            .then(res => {
              if (!res.ok) { throw new Error('Unauthorized') }
              return res.text()
            })
            .then(specification => {
              const docs = document.getElementById('docs')
              docs.apiDescriptionDocument = specification
            })
            .catch((error) => { })
          }

          ${config.nodeEnv === 'development' && 'loadDocumentation()'}

          function handleCredentialResponse(response) {
            document.getElementById("g-button").outerHTML = "";
            loadDocumentation(response.credential)
          }

         
        </script>
        
        ${config.nodeEnv === 'development' ? '' : '<div id="g-button"></div>'}
        <elements-api id="docs" layout="sidebar" router="hash" logo="https://www.inyourarea.co.uk/assets/favicon/android-icon-192x192.png" />

      </body>
      </html>
    `)
  })
})

export default swaggerPlugin
