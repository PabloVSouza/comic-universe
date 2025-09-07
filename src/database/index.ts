// ORM-agnostic database architecture
import { databaseFactory } from './factories/DatabaseFactory'
import { IDatabaseRepository, IDatabaseConfig } from './interfaces/IDatabaseRepository'

// Global repository instance
let repository: IDatabaseRepository | null = null

export async function initializeDatabase(dbPath: string): Promise<IDatabaseRepository> {
  if (repository) {
    console.log('Database already initialized');
    return repository;
  }

  try {
    console.log(`Initializing ORM-agnostic database at: ${dbPath}`);

    const config: IDatabaseConfig = {
      dbPath,
      enableForeignKeys: true,
      enableWAL: false,
      connectionTimeout: 10000
    }

    // Create and initialize repository using factory
    repository = await databaseFactory.createAndInitializeRepository(config);

    console.log('✅ ORM-agnostic database initialized successfully');
    return repository;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

export function getDatabase(): IDatabaseRepository {
  if (!repository) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return repository;
}

export function closeDatabase(): void {
  if (repository) {
    repository.close();
    repository = null;
    console.log('Database connection closed');
  }
}

// Export the factory for advanced usage
export { databaseFactory }

// Export interfaces and implementations
export * from './interfaces/IDatabaseRepository'
export * from './implementations/DrizzleDatabaseRepository'
export * from './factories/DatabaseFactory'

// Legacy exports for backward compatibility (deprecated)
export * from './schema'
