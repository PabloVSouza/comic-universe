import { Sequelize, DataTypes as sequelizeDataTypes, Model } from 'sequelize'

export function ChapterSequelizeModel(
  database: Sequelize,
  DataTypes: typeof sequelizeDataTypes
): void {
  class Chapter extends Model {
    public comicId!: string
    public siteId!: string
    public siteLink?: string
    public releaseId?: string
    public name?: string
    public number!: string
    public date?: string
    public offline!: boolean
    public _id!: string
    public createdAt!: Date
  }

  Chapter.init(
    {
      comicId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      siteId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      siteLink: {
        type: DataTypes.STRING
      },
      releaseId: {
        type: DataTypes.STRING
      },
      name: {
        type: DataTypes.STRING
      },
      number: {
        type: DataTypes.STRING,
        allowNull: false
      },
      date: {
        type: DataTypes.STRING
      },
      offline: {
        type: DataTypes.BOOLEAN,
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
      modelName: 'Chapter',
      timestamps: false
    }
  )

  // Define any associations with other models here
}
