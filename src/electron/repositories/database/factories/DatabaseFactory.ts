import { DrizzleDatabaseRepository } from '../implementations/DrizzleDatabaseRepository'
import {
  IDatabaseRepository,
  IDatabaseConfig,
  IDatabaseFactory
} from '../interfaces/IDatabaseRepository'

export type SupportedORM = 'drizzle' | 'prisma' | 'typeorm' | 'sequelize'

export class DatabaseFactory implements IDatabaseFactory {
  private static instance: DatabaseFactory
  private currentORM: SupportedORM = 'drizzle'

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): DatabaseFactory {
    if (!DatabaseFactory.instance) {
      DatabaseFactory.instance = new DatabaseFactory()
    }
    return DatabaseFactory.instance
  }

  createRepository(_config: IDatabaseConfig): IDatabaseRepository {
    // Create repository based on current ORM
    switch (this.currentORM) {
      case 'drizzle':
        return new DrizzleDatabaseRepository()
      case 'prisma':
        throw new Error('Prisma implementation not yet available')
      case 'typeorm':
        throw new Error('TypeORM implementation not yet available')
      case 'sequelize':
        throw new Error('Sequelize implementation not yet available')
      default:
        throw new Error(`Unsupported ORM: ${this.currentORM}`)
    }
  }

  getSupportedORMs(): string[] {
    return ['drizzle', 'prisma', 'typeorm', 'sequelize']
  }

  setORM(orm: SupportedORM): void {
    if (!this.getSupportedORMs().includes(orm)) {
      throw new Error(`Unsupported ORM: ${orm}`)
    }
    this.currentORM = orm
    // ORM switched successfully
  }

  getCurrentORM(): SupportedORM {
    return this.currentORM
  }

  // Convenience method to create and initialize a repository
  async createAndInitializeRepository(config: IDatabaseConfig): Promise<IDatabaseRepository> {
    const repository = this.createRepository(config)
    await repository.initialize(config.dbPath)
    return repository
  }
}

// Export singleton instance
export const databaseFactory = DatabaseFactory.getInstance()
