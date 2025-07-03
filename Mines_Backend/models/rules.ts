import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'

export const Rules = sequelize.define(
  'Rules',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rule_name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    rules: {
      type: DataTypes.JSON,
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
