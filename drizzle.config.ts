import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './src/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './dev-data/database/database.db'
  },
  verbose: true,
  strict: true
})
