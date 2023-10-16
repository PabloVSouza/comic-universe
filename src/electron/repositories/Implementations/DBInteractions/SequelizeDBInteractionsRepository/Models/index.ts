import { Sequelize, DataTypes, ModelCtor, Model } from 'sequelize'
import sqlite3 from 'sqlite3'
import { ComicSequelizeModel } from './ComicSequelizeModel'

export class SequelizeDBImplementation {
  public database: Sequelize

  public Comic: ModelCtor<Model>

  constructor() {
    this.database = new Sequelize({
      dialect: 'sqlite',
      storage: './db.sqlite',
      dialectOptions: {
        mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX
      }
    })

    this.Comic = ComicSequelizeModel(this.database, DataTypes)
  }
}
