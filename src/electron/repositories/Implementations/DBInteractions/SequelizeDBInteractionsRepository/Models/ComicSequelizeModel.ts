import { Sequelize, DataTypes as sequelizeDataTypes, Model, ModelCtor } from 'sequelize'

export function ComicSequelizeModel(
  database: Sequelize,
  DataTypes: typeof sequelizeDataTypes
): ModelCtor<Model> {
  class Comic extends Model {
    public siteId!: string
    public name!: string
    public cover!: string
    public repo!: string
    public author?: string
    public artist?: string
    public publisher?: string
    public status?: string
    public genres?: string
    public siteLink?: string
    public synopsis!: string
    public type!: string
    public _id!: string
    public createdAt!: Date
  }

  Comic.init(
    {
      siteId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      cover: {
        type: DataTypes.STRING,
        allowNull: false
      },
      repo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      author: {
        type: DataTypes.STRING
      },
      artist: {
        type: DataTypes.STRING
      },
      publisher: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.STRING
      },
      genres: {
        type: DataTypes.STRING
      },
      siteLink: {
        type: DataTypes.STRING
      },
      synopsis: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      _id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize: database,
      modelName: 'Comic',
      timestamps: false
    }
  )

  return Comic
}
