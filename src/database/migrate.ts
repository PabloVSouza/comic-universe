import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { comics, chapters, users, readProgress, plugins } from './schema'

export async function runDrizzleMigrations(dbPath: string): Promise<void> {
  console.log('Starting Drizzle automatic migrations...')

  const sqlite = new Database(dbPath)
  const db = drizzle(sqlite, {
    schema: { comics, chapters, users, readProgress, plugins }
  })

  try {
    await migrate(db, { migrationsFolder: './src/database/migrations' })
    console.log('✅ Drizzle migrations completed successfully')
  } catch (error) {
    console.error('❌ Drizzle migrations failed:', error)
    throw error
  } finally {
    sqlite.close()
  }
}

