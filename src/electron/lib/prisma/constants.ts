import path from 'path'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'

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
  public importPath: string
  public dbPath: string
  public sourceDBPath: string
  public dbUrl: string
  public mePath: string
  public qePath: string
  public extraResourcesPath: string
  public platformName: string
  public latestMigration: string

  public platformToExecutables = {}

  constructor(appPath: string) {
    function getPlatformName(): string {
      const isDarwin = process.platform === 'darwin'
      if (isDarwin && process.arch === 'arm64') {
        return process.platform + 'Arm64'
      }

      return process.platform
    }
    this.path = appPath

    this.platformToExecutables = {
      win32: {
        migrationEngine: `/db/@prisma/engines/migration-engine-windows.exe`,
        queryEngine: `node_modules/.prisma/client/query_engine-windows.dll.node`
      },
      linux: {
        migrationEngine: `/db/@prisma/engines/migration-engine-debian-openssl-1.1.x`,
        queryEngine: `node_modules/.prisma/client/libquery_engine-debian-openssl-1.1.x.so.node`
      },
      darwin: {
        migrationEngine: `/db/@prisma/engines/migration-engine-darwin`,
        queryEngine: `node_modules/.prisma/client/libquery_engine-darwin.dylib.node`
      },
      darwinArm64: {
        migrationEngine: `/db/@prisma/engines/migration-engine-darwin-arm64`,
        queryEngine: `node_modules/.prisma/client/libquery_engine-darwin-arm64.dylib.node`
      }
    }

    this.platformName = getPlatformName()
    this.dbPath = `${this.path}/db/database.db`
    this.dbUrl = is.dev
      ? 'file:../database.db'
      : `file:${this.dbPath}?socket_timeout=10&connection_limit=1`
    this.extraResourcesPath = appPath
    this.mePath = path.join(
      this.extraResourcesPath,
      this.platformToExecutables[this.platformName].migrationEngine
    )

    this.importPath = !is.dev
      ? path.join(app.getAppPath().replace('app.asar', ''), `app.asar.unpacked`)
      : ''

    this.qePath = path.join(
      this.importPath,
      this.platformToExecutables[this.platformName].queryEngine
    )

    this.sourceDBPath = path.join(this.importPath, 'prisma', 'database.db')

    this.latestMigration = '20231018232641_'
    process.env.DATABASE_URL = this.dbUrl
  }
}
