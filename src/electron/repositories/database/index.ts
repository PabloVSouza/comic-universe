// Database layer for electron repositories
import { databaseFactory } from './factories/DatabaseFactory'
import { IDatabaseRepository, IDatabaseConfig } from './interfaces/IDatabaseRepository'

// Global repository instance
let repository: IDatabaseRepository | null = null

export async function initializeDatabase(dbPath: string): Promise<IDatabaseRepository> {
  if (repository) {
    // Database already initialized
    return repository
  }

  try {
    // Initializing ORM-agnostic database

    const config: IDatabaseConfig = {
      dbPath,
      enableForeignKeys: true,
      enableWAL: false,
      connectionTimeout: 10000
    }

    // Create and initialize repository using factory
    repository = await databaseFactory.createAndInitializeRepository(config)

    // ORM-agnostic database initialized successfully
    return repository
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

export function getDatabase(): IDatabaseRepository {
  if (!repository) {
    throw new Error('Database not initialized. Call initializeDatabase() first.')
  }
  return repository
}

export function closeDatabase(): void {
  if (repository) {
    repository.close()
    repository = null
    // Database connection closed
  }
}

// Export the factory for advanced usage
export { databaseFactory }

// Export interfaces and implementations
export * from './interfaces/IDatabaseRepository'
export * from './implementations/DrizzleDatabaseRepository'
export * from './factories/DatabaseFactory'
