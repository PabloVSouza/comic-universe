import { PrismaConstants, Migration } from './constants'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'
import { fork } from 'child_process'

export class PrismaInitializer {
  public prisma: PrismaClient
  private appPath: string
  private constants: PrismaConstants

  constructor(appPath: string) {
    this.appPath = appPath
    this.constants = new PrismaConstants(appPath)
    console.log(this.constants)
    this.prisma = this.initializePrisma()
    this.initializePrisma()
    // this.runMigration()
  }

  private initializePrisma = (): PrismaClient => {
    if (this.constants.platformName === 'darwin')
      process.env.PRISMA_CLI_BINARY_TARGETS = 'darwin,darwin-arm64'
    return new PrismaClient({
      datasources: {
        db: {
          url: this.constants.dbUrl
        }
      },
      // @ts-expect-error internal prop
      __internal: {
        engine: {
          binaryPath: this.constants.qePath
        }
      }
    })
  }

  // @ts-ignore test
  private runMigration = async (): Promise<void> => {
    let needsMigration: boolean
    console.log(this.constants)
    const dbExists = fs.existsSync(this.constants.dbPath)
    if (!dbExists) {
      needsMigration = true
      fs.closeSync(fs.openSync(this.constants.dbPath, 'w'))
    } else {
      try {
        const latest: Migration[] = await this.prisma
          .$queryRaw`select * from _prisma_migrations order by finished_at`
        needsMigration =
          latest[latest.length - 1]?.migration_name !== this.constants.latestMigration
      } catch (e) {
        needsMigration = true
      }

      if (needsMigration) {
        const schemaPath = path.join(
          this.appPath.replace('app.asar', 'app.asar.unpacked'),
          'prisma',
          'schema.prisma'
        )
        await this.runPrismaCommand({
          command: ['migrate', 'deploy', '--schema', schemaPath],
          dbUrl: this.constants.dbUrl
        })
      }
    }
  }

  public runPrismaCommand = async ({
    command,
    dbUrl
  }: {
    command: string[]
    dbUrl: string
  }): Promise<void> => {
    const prismaPath = path.resolve(__dirname, '..', '..', 'node_modules/prisma/build/index.js')

    fork(prismaPath, command, {
      env: {
        ...process.env,
        DATABASE_URL: dbUrl,
        PRISMA_MIGRATION_ENGINE_BINARY: this.constants.mePath,
        PRISMA_QUERY_ENGINE_LIBRARY: this.constants.qePath,
        PRISMA_FMT_BINARY: this.constants.qePath,
        PRISMA_INTROSPECTION_ENGINE_BINARY: this.constants.qePath
      },
      stdio: 'pipe'
    })
  }
}
