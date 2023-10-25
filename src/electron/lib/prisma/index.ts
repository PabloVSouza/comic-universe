import { PrismaConstants, Migration } from './constants'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'
// import CreateDirectory from '../../utils/CreateDirectory'
import { fork } from 'child_process'

export class PrismaInitializer {
  public prisma: PrismaClient
  // private appPath: string
  private constants: PrismaConstants

  constructor(appPath: string) {
    // this.appPath = appPath
    this.constants = new PrismaConstants(appPath)
    // this.prepareDB()
    this.runMigration()
    this.prisma = this.initializePrisma()
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

  // private prepareDB = (): void => {
  //   const dbExists = fs.existsSync(this.constants.dbPath)
  //   if (!dbExists) {
  //     CreateDirectory(path.join(this.appPath, 'db'))
  //     // fs.copyFileSync(this.constants.sourceDBPath, this.constants.dbPath)
  //   }
  // }

  // @ts-ignore Not using yet
  private runMigration = async (): Promise<void> => {
    let needsMigration: boolean
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
        await this.runPrismaCommand({
          command: ['migrate', 'deploy', '--schema', this.constants.schemaPath],
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
  }): Promise<number | void> => {
    const prismaPath = path.resolve(__dirname, '..', '..', 'node_modules/prisma/build/index.js')

    try {
      const exitCode = await new Promise((resolve) => {
        const child = fork(prismaPath, command, {
          env: {
            ...process.env,
            DATABASE_URL: dbUrl,
            PRISMA_SCHEMA_ENGINE_BINARY: this.constants.mePath,
            PRISMA_QUERY_ENGINE_LIBRARY: this.constants.qePath,
            PRISMA_FMT_BINARY: this.constants.qePath,
            PRISMA_INTROSPECTION_ENGINE_BINARY: this.constants.qePath
          },
          stdio: 'pipe'
        })

        child.on('message', (msg) => {
          console.log(msg)
        })

        child.on('error', (err) => {
          console.log('Child process got error:', err)
        })

        child.on('close', (code) => {
          resolve(code)
        })

        child.stdout?.on('data', function (data) {
          console.log('prisma: ', data.toString())
        })

        child.stderr?.on('data', function (data) {
          console.log('prisma: ', data.toString())
        })
      })
      if (exitCode !== 0) throw Error(`command ${command} failed with exit code ${exitCode}`)
      return exitCode
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
