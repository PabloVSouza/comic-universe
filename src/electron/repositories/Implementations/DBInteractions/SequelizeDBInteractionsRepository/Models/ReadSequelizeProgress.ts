import { Sequelize, DataTypes as sequelizeDataTypes, Model } from 'sequelize'

export function ReadProgressSequelizeModel(
  database: Sequelize,
  DataTypes: typeof sequelizeDataTypes
): void {
  class ReadProgress extends Model {
    public comicId!: string
    public chapterId!: string
    public totalPages!: number
    public page!: number
    public _id!: string
    public createdAt!: Date
  }

  ReadProgress.init(
    {
      comicId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      chapterId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      totalPages: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      page: {
        type: DataTypes.INTEGER,
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
      modelName: 'ReadProgress',
      timestamps: false
    }
  )

  // Define any associations with other models here
}
