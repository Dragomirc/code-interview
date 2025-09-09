# Publications API

A Fastify-based REST API for managing publications with MongoDB integration.

## API Routes

### Publications

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|-------------|
| `GET` | `/pubs` | List all publications with optional filters | `/pubs?publisher=reach` |
| `POST` | `/publications` | Create a new publication | `{ "domain": "liverpoolecho.co.uk", "publisher": "reach", "targets": [ { "feedType": "google_sitemap",  "entrypoint": "https://www.liverpoolecho.co.uk/map_news.xml" } ]}` |
| `GET` | `/:id/publications` | Get a specific publication by ID | - |

## Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Test
npm test
```

## Project Structure

```
src/
├── application/
│   ├── routes/publications/    # API route handlers
│   ├── plugins/               # Fastify plugins (swagger, validation, error handling)
│   └── server.ts             # Server configuration
├── mongo/
│   ├── models/               # MongoDB models
│   └── connection.ts         # Database connection
├── services/                 # Business logic layer
├── utils/                    # Configuration and logging
└── index.ts                  # Application entry point
```

## Tech Stack

- **Framework**: Fastify
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Language**: TypeScript

## Environment

- Node.js 20
- npm 10