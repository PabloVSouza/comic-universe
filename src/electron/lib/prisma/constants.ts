import path from 'path'

export interface Migration {
  id: string
  checksum: string
  finished_at: string
  migration_name: string
  logs: string
  rolled_back_at: string
  started_at: string
  applied_steps_count: string
}

export class PrismaConstants {
  private path: string
  public dbPath: string
  public dbUrl: string
  public mePath: string
  public qePath: string
  public extraResourcesPath: string
  public platformName: string
  public latestMigration: string

  public platformToExecutables = {
    win32: {
      migrationEngine: 'node_modules/@prisma/engines/migration-engine-windows.exe',
      queryEngine: 'node_modules/@prisma/engines/query_engine-windows.dll.node'
    },
    linux: {
      migrationEngine: 'node_modules/@prisma/engines/migration-engine-debian-openssl-1.1.x',
      queryEngine: 'node_modules/@prisma/engines/libquery_engine-debian-openssl-1.1.x.so.node'
    },
    darwin: {
      migrationEngine: 'node_modules/@prisma/engines/migration-engine-darwin',
      queryEngine: 'node_modules/@prisma/engines/libquery_engine-darwin.dylib.node'
    },
    darwinArm64: {
      migrationEngine: 'node_modules/@prisma/engines/migration-engine-darwin-arm64',
      queryEngine: 'node_modules/@prisma/engines/libquery_engine-darwin-arm64.dylib.node'
    }
  }

  constructor(appPath: string) {
    function getPlatformName(): string {
      const isDarwin = process.platform === 'darwin'
      if (isDarwin && process.arch === 'arm64') {
        return process.platform + 'Arm64'
      }

      return process.platform
    }

    this.path = appPath
    this.platformName = getPlatformName()
    this.dbPath = `${this.path}/db/database.db`
    this.dbUrl = `file:${this.dbPath}`
    this.extraResourcesPath = appPath.replace('app.asar', '')
    this.mePath = path.join(
      this.extraResourcesPath,
      this.platformToExecutables[this.platformName].migrationEngine
    )
    this.qePath = path.join(
      this.extraResourcesPath,
      this.platformToExecutables[this.platformName].queryEngine
    )

    this.latestMigration = '20231016210533_first_official_migration'
    process.env.DATABASE_URL = this.dbUrl
  }
}
