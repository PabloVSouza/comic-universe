import { PrismaClient } from './generated'

export class PrismaInit {
  private prisma: PrismaClient

  constructor(private path: string) {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: this.path + '/database.db'
        }
      }
    })
  }
}
