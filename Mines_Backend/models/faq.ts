import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'

export const FAQ = sequelize.define(
  'FAQ',
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
    created_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'admins',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
)
