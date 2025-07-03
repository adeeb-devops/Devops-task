import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'

export const HowToPlay = sequelize.define(
  'HowToPlay',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: false,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'admins',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
)
