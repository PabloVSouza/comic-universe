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
  public schemaPath: string

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
        migrationEngine: `node_modules/@prisma/engines/schema-engine-windows.exe`,
        queryEngine: `node_modules/.prisma/client/query_engine-windows.dll.node`
      },
      linux: {
        migrationEngine: `node_modules/@prisma/engines/schema-engine-debian-openssl-1.1.x`,
        queryEngine: `node_modules/.prisma/client/libquery_engine-debian-openssl-1.1.x.so.node`
      },
      darwin: {
        migrationEngine: `node_modules/@prisma/engines/schema-engine-darwin`,
        queryEngine: `node_modules/.prisma/client/libquery_engine-darwin.dylib.node`
      },
      darwinArm64: {
        migrationEngine: `node_modules/@prisma/engines/schema-engine-darwin-arm64`,
        queryEngine: `node_modules/.prisma/client/libquery_engine-darwin-arm64.dylib.node`
      }
    }

    this.platformName = getPlatformName()
    this.dbPath = `${this.path}/db/database.db`
    this.dbUrl = is.dev
      ? 'file:../database.db?socket_timeout=10&connection_limit=1'
      : `file:${this.dbPath}?socket_timeout=10&connection_limit=1`
    this.extraResourcesPath = appPath

    this.importPath = !is.dev
      ? path.join(app.getAppPath().replace('app.asar', ''), `app.asar.unpacked`)
      : ''
    this.mePath = path.join(
      this.importPath,
      this.platformToExecutables[this.platformName].migrationEngine
    )
    this.qePath = path.join(
      this.importPath,
      this.platformToExecutables[this.platformName].queryEngine
    )

    this.schemaPath = path.join(this.importPath, 'prisma', 'schema.prisma')

    this.sourceDBPath = path.join(this.importPath, 'prisma', 'database.db')

    this.latestMigration = '20231025184053_added_languages'
    process.env.DATABASE_URL = this.dbUrl
  }
}
