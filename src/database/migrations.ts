import { sql } from 'drizzle-orm'
import { type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

export const migrations = [
  {
    version: 1,
    name: 'initial_schema',
    statements: [
      sql`CREATE TABLE IF NOT EXISTS "Plugin" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "enabled" BOOLEAN DEFAULT true NOT NULL,
        "name" TEXT NOT NULL,
        "repository" TEXT NOT NULL,
        "version" TEXT NOT NULL,
        "path" TEXT NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS "User" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "default" BOOLEAN DEFAULT false NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS "Comic" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "siteId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "cover" TEXT NOT NULL,
        "repo" TEXT NOT NULL,
        "author" TEXT,
        "artist" TEXT,
        "publisher" TEXT,
        "status" TEXT,
        "genres" TEXT,
        "siteLink" TEXT,
        "year" TEXT,
        "synopsis" TEXT NOT NULL,
        "type" TEXT NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS "Chapter" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "comicId" INTEGER NOT NULL,
        "siteId" TEXT NOT NULL,
        "siteLink" TEXT,
        "releaseId" TEXT,
        "repo" TEXT NOT NULL,
        "name" TEXT,
        "number" TEXT NOT NULL,
        "pages" TEXT,
        "date" TEXT,
        "offline" BOOLEAN DEFAULT false NOT NULL,
        "language" TEXT,
        FOREIGN KEY ("comicId") REFERENCES "Comic" ("id")
      )`,
      sql`CREATE TABLE IF NOT EXISTS "ReadProgress" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "chapterId" INTEGER NOT NULL,
        "comicId" INTEGER NOT NULL,
        "userId" INTEGER NOT NULL,
        "totalPages" INTEGER NOT NULL,
        "page" INTEGER NOT NULL,
        FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id"),
        FOREIGN KEY ("comicId") REFERENCES "Comic" ("id"),
        FOREIGN KEY ("userId") REFERENCES "User" ("id")
      )`,
      sql`CREATE TABLE IF NOT EXISTS "schema_migrations" (
        "version" INTEGER PRIMARY KEY,
        "name" TEXT NOT NULL,
        "applied_at" DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ]
  }
]

export async function runMigrations(db: BetterSQLite3Database<Record<string, unknown>>) {
  console.log('Starting database migrations...')

  // Create migrations table if it doesn't exist
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Get current version
  const currentVersionResult = (await db.get(sql`
    SELECT MAX(version) as version FROM schema_migrations
  `)) as { version: number } | undefined

  const currentVersion = currentVersionResult?.version || 0
  console.log(`Current database version: ${currentVersion}`)

  // Run pending migrations
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`Running migration ${migration.version}: ${migration.name}...`)

      try {
        // Run each statement individually
        for (const statement of migration.statements) {
          await db.run(statement)
        }

        await db.run(sql`
          INSERT INTO schema_migrations (version, name) VALUES (${migration.version}, ${migration.name})
        `)
        console.log(`✅ Migration ${migration.version} completed successfully`)
      } catch (error) {
        console.error(`❌ Migration ${migration.version} failed:`, error)
        throw error
      }
    }
  }

  console.log('Database migrations completed successfully')
}
