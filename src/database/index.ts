import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { app } from 'electron';
import path from 'path';
import { runMigrations } from './migrations';
import * as schema from './schema';

let db: any = null;
let sqlite: Database.Database | null = null;

export async function initializeDatabase(): Promise<any> {
  if (db) {
    console.log('Database already initialized');
    return db;
  }

  try {
    // Get the user data directory
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'database.db');
    
    console.log(`Initializing database at: ${dbPath}`);

    // Create database connection
    sqlite = new Database(dbPath);
    
    // Enable foreign keys
    sqlite.pragma('foreign_keys = ON');
    
    // Create Drizzle instance
    db = drizzle(sqlite, { schema });

    // Run migrations
    await runMigrations(db);

    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function getSqlite() {
  if (!sqlite) {
    throw new Error('SQLite not initialized. Call initializeDatabase() first.');
  }
  return sqlite;
}

export function closeDatabase() {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
    db = null;
    console.log('Database connection closed');
  }
}

// Export schema and service for use in other files
export * from './schema'
export { dbService } from './service'
