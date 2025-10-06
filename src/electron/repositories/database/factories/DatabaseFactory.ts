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
  }

  static getInstance(): DatabaseFactory {
    if (!DatabaseFactory.instance) {
      DatabaseFactory.instance = new DatabaseFactory()
    }
    return DatabaseFactory.instance
  }

  createRepository(_config: IDatabaseConfig): IDatabaseRepository {
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
  }

  getCurrentORM(): SupportedORM {
    return this.currentORM
  }

  async createAndInitializeRepository(config: IDatabaseConfig): Promise<IDatabaseRepository> {
    const repository = this.createRepository(config)
    await repository.initialize(config.dbPath)
    return repository
  }
}

export const databaseFactory = DatabaseFactory.getInstance()
