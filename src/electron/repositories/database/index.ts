import { databaseFactory } from './factories/DatabaseFactory'
import { IDatabaseRepository, IDatabaseConfig } from './interfaces/IDatabaseRepository'

let repository: IDatabaseRepository | null = null

export async function initializeDatabase(dbPath: string): Promise<IDatabaseRepository> {
  if (repository) {
    return repository
  }

  try {
    const config: IDatabaseConfig = {
      dbPath,
      enableForeignKeys: true,
      enableWAL: false,
      connectionTimeout: 10000
    }

    repository = await databaseFactory.createAndInitializeRepository(config)

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
  }
}

export { databaseFactory }

export * from './interfaces/IDatabaseRepository'
export * from './implementations/DrizzleDatabaseRepository'
export * from './factories/DatabaseFactory'
