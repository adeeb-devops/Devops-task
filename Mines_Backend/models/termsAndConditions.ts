import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'

export const TermsAndConditions = sequelize.define(
  'TermsAndConditions',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    terms: {
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
      onDelete: 'CASCADE',
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
)
