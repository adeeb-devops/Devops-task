import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'

export const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    message_name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },
    message_body: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['Active', 'Inactive'],
      defaultValue: 'Active',
    },
    client_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'distributors',
        key: 'distributor_id',
      },
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
